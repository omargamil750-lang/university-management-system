const Grade = require("../models/Grade");
const Submission = require("../models/Submission");
const Assignment = require("../models/Assignment");

const gradeSubmission = async (req, res) => {
  try {
    const { submissionId, grade, feedback } = req.body;

    if (!submissionId || grade === undefined) {
      return res.status(400).json({ message: "Submission and grade are required" });
    }

    // FIX: Validate grade range
    const numericGrade = Number(grade);
    if (isNaN(numericGrade) || numericGrade < 0 || numericGrade > 100) {
      return res.status(400).json({ message: "Grade must be a number between 0 and 100" });
    }

    const submission = await Submission.findById(submissionId).populate("assignment");
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    const assignment = await Assignment.findById(submission.assignment._id);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    if (String(assignment.professor) !== String(req.user._id)) {
      return res.status(403).json({ message: "You can only grade submissions for your own assignments" });
    }

    // FIX: Allow updating existing grade instead of blocking
    const existingGrade = await Grade.findOne({ submission: submissionId });
    if (existingGrade) {
      existingGrade.grade = numericGrade;
      existingGrade.feedback = feedback || existingGrade.feedback;
      await existingGrade.save();
      return res.status(200).json({ message: "Grade updated successfully", gradeRecord: existingGrade });
    }

    const newGrade = await Grade.create({
      submission: submissionId,
      student: submission.student,
      professor: req.user._id,
      assignment: assignment._id,
      course: assignment.course,
      grade: numericGrade,
      feedback: feedback || "",
    });

    submission.status = "graded";
    await submission.save();

    res.status(201).json({ message: "Submission graded successfully", gradeRecord: newGrade });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getGradesByStudent = async (req, res) => {
  try {
    if (
      req.user.role === "student" &&
      String(req.user._id) !== String(req.params.studentId)
    ) {
      return res.status(403).json({ message: "You can only view your own grades" });
    }

    const grades = await Grade.find({ student: req.params.studentId })
      .populate("assignment", "title dueDate")
      .populate("course", "code title")
      .populate("professor", "name email");

    res.status(200).json(grades);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// FIX: New - get all grades for a course (professor view)
const getGradesByCourse = async (req, res) => {
  try {
    const grades = await Grade.find({ course: req.params.courseId })
      .populate("student", "name email")
      .populate("assignment", "title")
      .populate("professor", "name");

    res.status(200).json(grades);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  gradeSubmission,
  getGradesByStudent,
  getGradesByCourse,
};