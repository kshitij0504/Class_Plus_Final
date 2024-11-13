const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

const handleOnetoOneChatSocket = (io) => {
  const onetooneIo = io.of("/onetoone");
  const activeUsers = new Map(); // Track active users
  const userSockets = new Map(); // Track user's socket connections

  function verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET_KEY);
    } catch (error) {
      console.error("Token verification failed:", error.message);
      return null;
    }
  }

  onetooneIo.use((socket, next) => {
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
      next();
    } catch (err) {
      console.error("Socket authentication error:", err.message);
      next(new Error("Authentication failed"));
    }
  });

  onetooneIo.on("connection", (socket) => {
    const userId = socket.userId;

    activeUsers.set(userId, true);
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId).add(socket.id);

    socket.broadcast.emit("user_status", { userId, status: "online" });

    socket.join(`user_${userId}`);

    // Handle room management
    socket.on("join_room", (chatRoomId) => {
      socket.join(`room_${chatRoomId}`);
      socket.to(`room_${chatRoomId}`).emit("user_joined", { userId });
    });

    socket.on("leave_room", (chatRoomId) => {
      socket.leave(`room_${chatRoomId}`);
      socket.to(`room_${chatRoomId}`).emit("user_left", { userId });
    });

    // Handle text messages
    socket.on("send_message", async (data) => {
      const { chatRoomId, content } = data;
      try {
        const message = {
          chatRoomId,
          content,
          senderId: userId,
          sentAt: new Date(),
          status: "sent"
        };

        onetooneIo.to(`room_${chatRoomId}`).emit("new_message", message);
        socket.to(`room_${chatRoomId}`).emit("stop_typing", { userId });
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Voice message handler
    socket.on("send_voice_message", async (data) => {
      const { chatRoomId, audioBuffer, duration } = data;
      try {
        const message = {
          chatRoomId,
          audioBuffer, // The recorded audio data
          senderId: userId,
          sentAt: new Date(),
          duration,    // Optional duration of the audio
          status: "sent"
        };

        // Broadcast to room
        onetooneIo.to(`room_${chatRoomId}`).emit("new_voice_message", message);
      } catch (error) {
        console.error("Error sending voice message:", error);
        socket.emit("error", { message: "Failed to send voice message" });
      }
    });

    // Typing indicators
    socket.on("typing", ({ chatRoomId }) => {
      socket.to(`room_${chatRoomId}`).emit("typing", { userId });
    });

    socket.on("stop_typing", ({ chatRoomId }) => {
      socket.to(`room_${chatRoomId}`).emit("stop_typing", { userId });
    });

    socket.on("disconnect", () => {
      const userSocketSet = userSockets.get(userId);
      if (userSocketSet) {
        userSocketSet.delete(socket.id);

        if (userSocketSet.size === 0) {
          activeUsers.delete(userId);
          userSockets.delete(userId);
          socket.broadcast.emit("user_status", { userId, status: "offline" });
        }
      }
    });
  });

  return onetooneIo;
};

module.exports = handleOnetoOneChatSocket;
