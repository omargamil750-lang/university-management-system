const mongoose = require("mongoose");

const performanceSchema = new mongoose.Schema({
  staff: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  period: { type: String, required: true }, // e.g. "2024-2025 S1"
  teachingScore: { type: Number, min: 0, max: 10 },
  researchScore: { type: Number, min: 0, max: 10 },
  serviceScore: { type: Number, min: 0, max: 10 },
  overallScore: { type: Number, min: 0, max: 10 },
  comments: { type: String, default: "" },
  goals: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model("PerformanceRecord", performanceSchema);