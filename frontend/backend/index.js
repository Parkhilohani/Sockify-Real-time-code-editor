import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import axios from "axios";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  // allows frontend to connect
  cors: {
    origin: "*",
  },
});

//keep track of room members
const rooms = new Map();

io.on("connection", (socket) => {
  console.log("User Connected", socket.id);

  let currentRoom = null;
  let currentUser = null;

  socket.on("join", ({ roomId, userName }) => {
    // Leave previous room if any
    if (currentRoom) {
      socket.leave(currentRoom);
      const room = rooms.get(currentRoom);
      if (room) {
        room.users.delete(currentUser);
        io.to(currentRoom).emit(
          "userJoined",
          Array.from(room.users).map((username) => ({ username }))
        );
      }
    }

    currentRoom = roomId;
    currentUser = userName;

    socket.join(roomId);

    // Create room if it doesn't exist
    if (!rooms.has(roomId)) {
      rooms.set(roomId, { users: new Set(), code: "// start code here" });
    }

    rooms.get(roomId).users.add(userName);

    // Send current code to newly joined user
    socket.emit("codeUpdate", rooms.get(roomId).code);

    // Broadcast updated users list
    io.to(roomId).emit(
      "userJoined",
      Array.from(rooms.get(roomId).users).map((username) => ({ username }))
    );
  });

  socket.on("codeChange", ({ roomId, code }) => {
    if (rooms.has(roomId)) {
      rooms.get(roomId).code = code;
    }
    socket.to(roomId).emit("codeUpdate", code);
  });

  socket.on("leaveRoom", () => {
    if (currentRoom && currentUser) {
      const room = rooms.get(currentRoom);
      if (room) {
        room.users.delete(currentUser);
        io.to(currentRoom).emit(
          "userJoined",
          Array.from(room.users).map((username) => ({ username }))
        );
      }

      socket.leave(currentRoom);

      currentRoom = null;
      currentUser = null;
    }
  });

  socket.on("typing", ({ roomId, userName }) => {
    socket.to(roomId).emit("userTyping", userName);
  });

  socket.on("languageChange", ({ roomId, language }) => {
    io.to(roomId).emit("languageUpdate", language);
  });

  socket.on(
    "compileCode",
    async ({ code, roomId, language, version, input }) => {
      if (rooms.has(roomId)) {
        const room = rooms.get(roomId);
        try {
          const response = await axios.post(
            "https://emkc.org/api/v2/piston/execute",
            {
              language,
              version,
              files: [{ content: code }],
              stdin: input,
            }
          );
          room.output = response.data.run.output;
          io.to(roomId).emit("codeResponse", response.data);
        } catch (error) {
          console.error("Compilation error:", error.message);
          io.to(roomId).emit("codeResponse", {
            run: { output: "Error during compilation" },
          });
        }
      }
    }
  );

  socket.on("disconnect", () => {
    if (currentRoom && currentUser) {
      const room = rooms.get(currentRoom);
      if (room) {
        room.users.delete(currentUser);
        io.to(currentRoom).emit(
          "userJoined",
          Array.from(room.users).map((username) => ({ username }))
        );
      }
    }
    console.log("User Disconnected:", socket.id);
  });
});

const port = process.env.PORT || 5001;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
