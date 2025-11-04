import mongoose from "mongoose";

const savedCodeSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  code: { type: String, required: true },
  savedBy: { type: String, required: true },
  savedAt: { type: Date, default: Date.now },
})

const roomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  users: [{ type: String }], 
  createdAt: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now},
  code: { type: String, default: "" }, // current session code
  savedCodes: [savedCodeSchema],
});



export default mongoose.model("Room", roomSchema);
