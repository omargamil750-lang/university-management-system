const mongoose = require("mongoose");

const gradeSchema = new mongoose.Schema(
  {
    submission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Submission",
      required: true,
      unique: true,
    },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    professor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignment: { type: mongoose.Schema.Types.ObjectId, ref: "Assignment", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    grade: { type: Number, required: true },
    feedback: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Grade", gradeSchema);