const express = require("express");
const http = require("http");
const { v4: uuidV4 } = require("uuid");
const socketIo = require("socket.io");
const { ExpressPeerServer } = require("peer");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.set("view engine", "ejs");
app.use(express.static("public"));

const peerServer = ExpressPeerServer(server, {
  debug: true,
});
app.use("/peerjs", peerServer);

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/room", (req, res) => {
  res.redirect(`/room/${uuidV4()}`);
});

app.get("/room/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).emit("user-connected", userId);

    socket.on("disconnect", () => {
      socket.to(roomId).emit("user-disconnected", userId);
    });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
