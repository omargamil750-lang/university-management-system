const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  building: { type: String, required: true, trim: true },
  floor: { type: Number, required: true },
  capacity: { type: Number, required: true },
  type: { type: String, enum: ["classroom", "lab", "seminar", "auditorium", "office"], required: true },
  facilities: [{ type: String }], // e.g. ["projector", "whiteboard", "AC"]
  isAvailable: { type: Boolean, default: true },
  imageUrl: { type: String, default: "" },
}, { timestamps: true });

module.exports = mongoose.model("Room", roomSchema);