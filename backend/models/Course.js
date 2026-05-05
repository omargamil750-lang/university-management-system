const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true, trim: true },
    type: { type: String, enum: ["core", "elective"], required: true },
    creditHours: { type: Number, required: true },
    description: { type: String, default: "" },
    professor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    // NEW: Teaching assistants assigned to this course
    assistants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);