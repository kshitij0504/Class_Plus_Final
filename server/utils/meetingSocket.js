// meetingSocket.js
const jwt = require("jsonwebtoken");

const handleMeetingSocket = (io) => {
  const rooms = new Map();
  const userStreams = new Map();
  const meetingIo = io.of("/meeting");

  function verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET_KEY);
    } catch (error) {
      console.error("Token verification failed:", error.message);
      return null;
    }
  }

  meetingIo.use((socket, next) => {
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

  meetingIo.on("connection", (socket) => {
    console.log(`User connected (Meeting): ${socket.id}`);

    // Handle joining a meeting room
    socket.on("joinGroup", async ({ groupId, userId, meetingId }) => {
      try {
        const roomId = `meeting_${meetingId}`;
        socket.join(roomId);

        if (!rooms.has(roomId)) {
          rooms.set(roomId, new Map());
        }

        const room = rooms.get(roomId);
        room.set(socket.id, {
          userId: socket.userId,
          name: socket.user?.name,
          isHost: false,
        });

        socket.to(roomId).emit("user-joined", {
          userId: socket.id,
          name: socket.user?.name,
          timestamp: new Date().toISOString(),
        });

        const participants = Array.from(room.entries()).map(([id, user]) => ({
          id,
          name: user.name,
          isHost: user.isHost,
        }));

        socket.emit("existing-participants", { participants, roomId });
        socket.meetingRoom = roomId;
      } catch (error) {
        console.error("Error in joinGroup:", error);
        socket.emit("error", {
          message: "Failed to join meeting room",
          details: error.message,
        });
      }
    });

    socket.on("offer", ({ target, offer }) => {
      socket.to(target).emit("offer", { offer, from: socket.id });
    });

    socket.on("answer", ({ target, answer }) => {
      socket.to(target).emit("answer", { answer, from: socket.id });
    });

    socket.on("ice-candidate", ({ target, candidate }) => {
      socket.to(target).emit("ice-candidate", { candidate, from: socket.id });
    });

    socket.on("stream-status", ({ audio, video }) => {
      if (socket.meetingRoom) {
        socket.to(socket.meetingRoom).emit("participant-stream-status", {
          userId: socket.id,
          audio,
          video,
        });
      }
    });

    const handleDisconnect = () => {
      try {
        if (socket.meetingRoom) {
          const room = rooms.get(socket.meetingRoom);
          if (room) {
            room.delete(socket.id);
            socket
              .to(socket.meetingRoom)
              .emit("user-left", {
                userId: socket.id,
                timestamp: new Date().toISOString(),
              });

            if (room.size === 0) {
              rooms.delete(socket.meetingRoom);
            }
          }
        }
        userStreams.delete(socket.id);
      } catch (error) {
        console.error("Error handling disconnect:", error);
      }
    };

    socket.on("disconnect", handleDisconnect);
    socket.on("leave-meeting", handleDisconnect);
  });
};

module.exports = handleMeetingSocket;
