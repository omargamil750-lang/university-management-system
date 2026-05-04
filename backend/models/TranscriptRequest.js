const mongoose = require("mongoose");

const transcriptSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  requestedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ["pending", "processing", "ready", "rejected"], default: "pending" },
  purpose: { type: String, required: true },
  deliveryMethod: { type: String, enum: ["email", "pickup", "mail"], default: "email" },
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  notes: { type: String, default: "" },
}, { timestamps: true });

module.exports = mongoose.model("TranscriptRequest", transcriptSchema);