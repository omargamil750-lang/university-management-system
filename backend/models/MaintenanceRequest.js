const mongoose = require("mongoose");

const maintenanceSchema = new mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", default: null },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
  status: { type: String, enum: ["open", "in_progress", "resolved"], default: "open" },
}, { timestamps: true });

module.exports = mongoose.model("MaintenanceRequest", maintenanceSchema);