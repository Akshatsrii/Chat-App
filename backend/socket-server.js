const { Server } = require("socket.io");

const io = new Server(3001, {
  cors: { origin: "*" }
});

let users = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", ({ userId, roomId }) => {
    socket.join(roomId);
    users[socket.id] = userId;
  });

  socket.on("sendMessage", (data) => {
    io.to(data.roomId).emit("receiveMessage", data);
  });

  socket.on("typing", (roomId) => {
    socket.to(roomId).emit("typing");
  });

  socket.on("disconnect", () => {
    delete users[socket.id];
  });
});