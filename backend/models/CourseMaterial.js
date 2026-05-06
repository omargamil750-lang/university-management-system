const mongoose = require("mongoose");

const materialSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  description: { type: String, default: "" },
  fileUrl: { type: String, required: true },
  fileType: { type: String, default: "document" }, // pdf, video, link, etc.
  week: { type: Number, default: 1 },
}, { timestamps: true });

module.exports = mongoose.model("CourseMaterial", materialSchema);