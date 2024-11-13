// chatSocket.js
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const handleChatSocket = (io, prisma) => {
  const chatIo = io.of("/chat");

  function verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET_KEY);
    } catch (error) {
      console.error("Token verification failed:", error.message);
      return null;
    }
  }

  chatIo.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication required"));
    }

    try {
      const decoded = verifyToken(token);
      console.log(decoded)
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

  chatIo.on("connection", (socket) => {
    console.log(`User connected (Chat): ${socket.id}`);

    socket.on("joinChat", (groupId) => {
      if (!groupId) return;
      socket.join(groupId);
      console.log(`User ${socket.userId} joined chat group: ${groupId}`);
    });

    socket.on("leaveChat", (groupId) => {
      if (!groupId) return;
      socket.leave(groupId);
      console.log(`User ${socket.userId} left chat group: ${groupId}`);
    });

    socket.on("startTyping", (groupId) => {
      socket.to(groupId).emit("userTyping", { userId: socket.userId });
    });

    socket.on("stopTyping", (groupId) => {
      socket.to(groupId).emit("userStoppedTyping", { userId: socket.userId });
    });

    socket.on("sendMessage", async (data) => {
      try {
        const { groupId, content, fileUrl, fileName, fileType } = data;
        const groupIdInt = parseInt(groupId);
        const savedMessage = await prisma.message.create({
          data: {
            content: content,
            userId: socket.userId,
            groupId: groupIdInt,
            fileUrl: fileUrl || null,
            fileName: fileName || null,
            fileType: fileType || null,
          },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
              },
            },
          },
        });

        const messageData = {
          id: savedMessage.id,
          content: savedMessage.content,
          userId: savedMessage.userId,
          createdAt: savedMessage.createdAt,
          fileUrl: savedMessage.fileUrl,
          fileName: savedMessage.fileName,
          fileType: savedMessage.fileType,
          user: {
            id: savedMessage.user.id,
            username: savedMessage.user.username,
            avatar: savedMessage.user.avatar,
          },
        };

        chatIo.to(groupId).emit("messageReceived", messageData);
      } catch (error) {
        console.error("Error handling message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });
  });
};

module.exports = handleChatSocket;
