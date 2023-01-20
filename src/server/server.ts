import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";

const rooms: any = {};

const io = new Server({
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  socket.on("create-room", () => {
    const id = uuidv4();
    rooms[id] = { id, players: [] };
    socket.emit("created-room", rooms[id]);
  });

  socket.on("join-room", (id) => {
    if (rooms[id]) {
      rooms[id].players.push(socket.id);
    }

    socket.emit("joined-room", rooms[id]);
  });
});

io.listen(3001);

console.log("Server is happy");
