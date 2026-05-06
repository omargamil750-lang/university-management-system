const mongoose = require("mongoose");

const universityAnnouncementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  targetAudience: { type: String, enum: ["all", "students", "staff", "professors"], default: "all" },
  priority: { type: String, enum: ["low", "normal", "urgent"], default: "normal" },
  pinned: { type: Boolean, default: false },
  expiresAt: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model("Announcement", universityAnnouncementSchema);