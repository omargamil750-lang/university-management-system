const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  type: { type: String, enum: ["academic", "cultural", "sports", "seminar", "holiday", "other"], required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  location: { type: String, default: "" },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  isPublic: { type: Boolean, default: true },
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  imageUrl: { type: String, default: "" },
}, { timestamps: true });

module.exports = mongoose.model("Event", eventSchema);