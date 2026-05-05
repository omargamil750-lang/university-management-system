const Assignment = require("../models/Assignment");
const Course = require("../models/Course");
const Submission = require("../models/Submission");

const createAssignment = async (req, res) => {
  try {
    const { course, title, description, dueDate } = req.body;

    if (!course || !title || !dueDate) {
      return res.status(400).json({ message: "Required assignment fields are missing" });
    }

    const foundCourse = await Course.findById(course);
    if (!foundCourse) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (String(foundCourse.professor) !== String(req.user._id)) {
      return res.status(403).json({
        message: "You can only create assignments for your assigned courses",
      });
    }

    const assignment = await Assignment.create({
      course,
      professor: req.user._id,
      title,
      description,
      dueDate,
    });

    res.status(201).json({ message: "Assignment created successfully", assignment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAssignmentsByCourse = async (req, res) => {
  try {
    const assignments = await Assignment.find({ course: req.params.courseId })
      .populate("course", "code title type")
      .populate("professor", "name email");

    res.status(200).json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    if (String(assignment.professor) !== String(req.user._id)) {
      return res.status(403).json({ message: "You can only delete your own assignments" });
    }

    // Also remove related submissions
    await Submission.deleteMany({ assignment: assignment._id });
    await assignment.deleteOne();

    res.status(200).json({ message: "Assignment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createAssignment,
  getAssignmentsByCourse,
  deleteAssignment,
};