import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });
const connectedClients = new Set();
const rooms = new Map();
let roomId = 1;

wss.on("connection", (ws) => {
  connectedClients.add(ws);
  ws.send("Welcome to the WebSocket server!");
  console.log("Connection opened");

  ws.on("error", (err) => {
    console.error(err);
  });

  ws.on("close", () => {
    connectedClients.delete(ws);
    const myroom = rooms.get(ws.roomId);
    rooms.get(myroom).delete(ws);
  });

  ws.on("message", (data) => {
    const msg = JSON.parse(data.toString());
    if (msg.type === "create") {
      rooms.set(roomId, new Set());
      rooms.get(roomId).add(ws);
      ws.roomId = roomId;
      ws.send(`Room is created and joined : ${roomId}`);
      roomId++;
    }

    if (msg.type === "join") {
      const id = parseInt(msg.roomId);
      if (rooms.has(id)) {
        rooms.get(id).add(ws);
        ws.roomId = id;
        ws.send(`Joinded the room of Id : ${id}`);
      } else {
        ws.send(`couldn't find a room with id ${id}`);
      }
    }

    if (msg.type === "message") {
      const room = rooms.get(ws.roomId);
      if (!room) return;
      room.forEach((client) => {
        if (client != ws && client.readyState === 1) {
          client.send(msg.message);
        }
      });
    }
  });
});
