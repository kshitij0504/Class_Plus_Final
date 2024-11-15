require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const cookieParser = require("cookie-parser");
const router = require("./router/index");
const prisma = require("./config/connectDb");
const jwt = require("jsonwebtoken");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "https://classplus.vercel.app",
    methods: ["GET", "POST"],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ["websocket", "polling"],
});
const adminRouter = require("./router/adminroute");
const handleChatSocket = require("./utils/chatSocket");
const handleMeetingSocket = require("./utils/meetingSocket");
const handleOnetoOneChatSocket = require("./utils/onetoonechatsocket");

// Middleware setup
app.use(cookieParser());
app.use(cors({ origin: ["https://classplus.vercel.app", "http://localhost:5173"],credentials: true }));
app.use(express.json());

app.use((req, res, next) => {
  req.io = io;
  next();
});



handleChatSocket(io, prisma);
handleMeetingSocket(io);
handleOnetoOneChatSocket(io)

app.use("/api", router);
app.use("/admin", adminRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ message: "Something broke!", error: err.message });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { io, app };
