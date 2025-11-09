import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import path from "path";
import axios from "axios";
import mongoose from "mongoose";
import Room from "./models/Room.js";

const app = express();
app.use(cors());
app.use(express.json());

//connect to mongodb
mongoose
  .connect("mongodb://127.0.0.1:27017/realtimeEditor", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const server = http.createServer(app);

const io = new Server(server, {
  // allows frontend to connect
  cors: {
    origin: "*",
  },
});

//keep track of room members
const rooms = new Map();

// Create a new room
app.post("/api/rooms/create", async (req, res) => {
  try {
    const { roomId, userName } = req.body;
    const room = new Room({
      roomId,
      users: [userName],
    });
    await room.save();
    res.status(201).json({ success: true, room });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Join existing room
app.post("/api/rooms/join", async (req, res) => {
  try {
    const { roomId, userName } = req.body;
    const room = await Room.findOne({ roomId });

    if (!room) {
      return res
        .status(404)
        .json({ success: false, message: "Room not found" });
    }

    if (!room.users.includes(userName)) {
      room.users.push(userName);
      await room.save();
    }

    res.json({ success: true, room });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


io.on("connection", (socket) => {
  console.log("User Connected", socket.id);

  socket.on("join", async ({ roomId, userName }) => {
    socket.join(roomId);

    // Attach metadata to socket
    socket.data = { roomId, userName };

    // Create room if not exist
    if (!rooms.has(roomId)) {
      rooms.set(roomId, { users: new Map(), code: "// start code here" });
    }

    const room = rooms.get(roomId);

    //Add or update this user’s socket ID
    room.users.set(userName, socket.id);

    // Fetch from DB if available
    const dbRoom = await Room.findOne({ roomId });
    if (dbRoom) {
      room.code = dbRoom.code;
      socket.emit("loadSavedCodes", dbRoom.savedCodes);
    }

    // Send latest code to the joining user
    socket.emit("codeUpdate", room.code);

    // Broadcast updated users list
    io.to(roomId).emit(
      "userJoined",
      Array.from(room.users.keys()).map((u) => ({ username: u }))
    );
  });

  socket.on("leaveRoom", () => {
    const { roomId, userName } = socket.data || {};
    if (roomId && rooms.has(roomId)) {
      const room = rooms.get(roomId);
      room.users.delete(userName);
      io.to(roomId).emit(
        "userJoined",
        Array.from(room.users.keys()).map((u) => ({ username: u }))
      );
      socket.leave(roomId);
    }
  });

  socket.on("disconnect", () => {
    const { roomId, userName } = socket.data || {};
    if (!roomId || !rooms.has(roomId)) return;

    const room = rooms.get(roomId);

    //Check if user has another active socket (after refresh)
    const stillConnected = Array.from(io.sockets.sockets.values()).some(
      (s) => s.data?.userName === userName && s.data?.roomId === roomId
    );

    if (!stillConnected) {
      room.users.delete(userName);
      io.to(roomId).emit(
        "userJoined",
        Array.from(room.users.keys()).map((u) => ({ username: u }))
      );
    }

    console.log("User Disconnected:", userName);
  });

  socket.on("codeChange", async ({ roomId, code }) => {
    if (rooms.has(roomId)) {
      rooms.get(roomId).code = code;
      await Room.updateOne({ roomId }, { code }, { upsert: true });
    }
    socket.to(roomId).emit("codeUpdate", code);
  });

  socket.on("typing", ({ roomId, userName }) => {
    socket.to(roomId).emit("userTyping", userName);
  });

  socket.on("languageChange", ({ roomId, language }) => {
    io.to(roomId).emit("languageUpdate", language);
  });

  socket.on("compileCode", async ({ code, roomId, language, version, input }) => {
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
  });

  socket.on("saveCode", async ({ roomId, code, userName, fileName }) => {
    try {
      const dbRoom = await Room.findOne({ roomId });
      if (!dbRoom) {
        socket.emit("codeSaved", { success: false, message: "Room not found" });
        return;
      }

      if (rooms.has(roomId)) {
        rooms.get(roomId).code = code;
      }

      dbRoom.savedCodes.push({
        fileName: fileName || `untitled-${Date.now()}`,
        code,
        savedBy: userName || "Unknown User",
        savedAt: new Date(),
      });

      dbRoom.code = code;
      await dbRoom.save();

      socket.emit("codeSaved", { success: true, message: "Code saved successfully!" });
      io.to(roomId).emit("loadSavedCodes", dbRoom.savedCodes);
    } catch (err) {
      console.error("Error saving code:", err);
      socket.emit("codeSaved", { success: false, message: err.message });
    }
  });
});

const port = process.env.PORT || 5001;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
