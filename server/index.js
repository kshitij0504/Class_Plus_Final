require('dotenv').config();
const express = require("express");
const cors = require("cors");
const app = express();
const http = require('http')
const server = http.createServer(app);
const socketIo = require('socket.io')
const cron = require('node-cron');
const cookieParser = require("cookie-parser");
const router = require("./router/index");
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

app.use((req, res, next) => {
  req.io = io;
  next();
});

io.on('connection', (socket) => {
  console.log('A client connected');
});

const PORT = process.env.PORT || 8000;
app.use("/api", router);

server.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});

module.exports = { io };