require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const http = require("http");
const server = http.createServer(app);
const socketIo = require("socket.io");
const cookieParser = require("cookie-parser");
const router = require("./router/index");
const prisma = require("./config/connectDb");
const jwt = require("jsonwebtoken");

// Configure Socket.IO with proper options
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['websocket', 'polling']
});

// Middleware setup
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());

// Make io accessible in routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// JWT verification helper
function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET_KEY);
  } catch (error) {
    console.error("Token verification failed:", error.message);
    return null;
  }
}

// Track active rooms and connections
const rooms = new Map();
const activeConnections = new Map();
const userStreams = new Map();

// Socket authentication middleware
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    return next(new Error("Authentication required"));
  }

  try {
    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) {
      throw new Error("Invalid token");
    }
    
    socket.userId = decoded.id;
    socket.user = decoded;
    
    // Store socket connection
    activeConnections.set(decoded.id, socket);
    next();
  } catch (err) {
    console.error("Socket authentication error:", err.message);
    next(new Error("Authentication failed"));
  }
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle joining a meeting room
  socket.on("joinGroup", async ({ groupId, userId, meetingId }) => {
    try {
      const roomId = `meeting_${meetingId}`;
      
      // Join the Socket.IO room
      socket.join(roomId);
      
      // Initialize room if it doesn't exist
      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Map());
      }
      
      const room = rooms.get(roomId);
      room.set(socket.id, {
        userId: socket.userId,
        name: socket.user?.name,
        isHost: false // You can set this based on your logic
      });

      // Notify existing participants about the new user
      socket.to(roomId).emit("user-joined", {
        userId: socket.id,
        name: socket.user?.name,
        timestamp: new Date().toISOString()
      });

      // Send existing participants to the new user
      const participants = Array.from(room.entries()).map(([id, user]) => ({
        id,
        name: user.name,
        isHost: user.isHost
      }));

      socket.emit("existing-participants", {
        participants,
        roomId
      });

      // Log room status
      console.log(`User ${socket.id} joined ${roomId}. Current participants:`, participants.length);
      
      // Store user's room for cleanup
      socket.meetingRoom = roomId;
      
    } catch (error) {
      console.error("Error in joinGroup:", error);
      socket.emit("error", {
        message: "Failed to join meeting room",
        details: error.message
      });
    }
  });

  // WebRTC Signaling handlers
  socket.on("offer", ({ target, offer }) => {
    try {
      socket.to(target).emit("offer", {
        offer,
        from: socket.id
      });
      console.log(`Offer sent from ${socket.id} to ${target}`);
    } catch (error) {
      console.error("Error handling offer:", error);
    }
  });

  socket.on("answer", ({ target, answer }) => {
    try {
      socket.to(target).emit("answer", {
        answer,
        from: socket.id
      });
      console.log(`Answer sent from ${socket.id} to ${target}`);
    } catch (error) {
      console.error("Error handling answer:", error);
    }
  });

  socket.on("ice-candidate", ({ target, candidate }) => {
    try {
      socket.to(target).emit("ice-candidate", {
        candidate,
        from: socket.id
      });
    } catch (error) {
      console.error("Error handling ICE candidate:", error);
    }
  });

  // Handle stream status updates
  socket.on("stream-status", ({ audio, video }) => {
    if (socket.meetingRoom) {
      socket.to(socket.meetingRoom).emit("participant-stream-status", {
        userId: socket.id,
        audio,
        video
      });
    }
  });

  // Handle chat messages
  socket.on("chat-message", ({ message, roomId }) => {
    try {
      io.to(roomId).emit("chat-message", {
        userId: socket.id,
        name: socket.user?.name,
        message,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error handling chat message:", error);
    }
  });


  // Handle user leaving
  const handleDisconnect = () => {
    try {
      console.log(`User disconnected: ${socket.id}`);

      // Remove user from their meeting room
      if (socket.meetingRoom) {
        const room = rooms.get(socket.meetingRoom);
        if (room) {
          room.delete(socket.id);
          
          // Notify other participants
          socket.to(socket.meetingRoom).emit("user-left", {
            userId: socket.id,
            timestamp: new Date().toISOString()
          });

          // Clean up empty room
          if (room.size === 0) {
            rooms.delete(socket.meetingRoom);
            console.log(`Room ${socket.meetingRoom} deleted - no participants left`);
          }
        }
      }

      // Clean up user connections
      activeConnections.delete(socket.userId);
      userStreams.delete(socket.id);

    } catch (error) {
      console.error("Error handling disconnect:", error);
    }
  };

  socket.on("disconnect", handleDisconnect);
  socket.on("leave-meeting", handleDisconnect);

  socket.on("joinChat", (groupId) => {
    if (!groupId) return;
    
    socket.join(groupId);
    console.log(`User ${socket.userId} joined chat group: ${groupId}`);
  });

  // Handle leaving a chat group
  socket.on("leaveChat", (groupId) => {
    if (!groupId) return;
    
    socket.leave(groupId);
    console.log(`User ${socket.userId} left chat group: ${groupId}`);
  });

  // Handle new chat messages
  socket.on("sendMessage", async (data) => {
    try {
      const { groupId, content } = data;
      const groupIdInt = parseInt(groupId)
      const savedMessage = await prisma.message.create({
        data: {
          content: content,
          userId: socket.userId,
          groupId: groupIdInt,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true, 
              avatar: true
            }
          }
        }
      });
      const messageData = {
        id: savedMessage.id,
        content: savedMessage.content,
        userId: savedMessage.userId,
        createdAt: savedMessage.createdAt,
        user: {
          id: savedMessage.user.id,
          username: savedMessage.user.username,
          avatar: savedMessage.user.avatar
        }
      };
      // Then, emit the message to all users in the group
      io.to(groupId).emit("messageReceived",messageData);
    } catch (error) {
      console.error("Error handling message:", error);
      socket.emit("error", { message: "Failed to send message" });
    }
  });


  // Handle disconnection
  socket.on("disconnection", () => {
    console.log(`User disconnected: ${socket.id}`);
  });

  // Handle errors
  socket.on("error", (error) => {
    console.error("Socket error:", error);
    socket.emit("error", {
      message: "An error occurred",
      details: error.message
    });
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({
    message: 'Something broke!',
    error: err.message
  });
});

// API routes
app.use("/api", router);

// Start server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...'); 
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = { io, app };