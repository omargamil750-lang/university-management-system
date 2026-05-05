const Submission = require("../models/Submission");
const Assignment = require("../models/Assignment");
const Course = require("../models/Course");

const submitAssignment = async (req, res) => {
  try {
    const { assignment, content } = req.body;

    if (!assignment || !content) {
      return res.status(400).json({ message: "Assignment and content are required" });
    }

    const foundAssignment = await Assignment.findById(assignment);
    if (!foundAssignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    // FIX: Check due date — reject late submissions
    if (new Date() > new Date(foundAssignment.dueDate)) {
      return res.status(400).json({ message: "The due date for this assignment has passed" });
    }

    // FIX: Check student is enrolled in the course
    const course = await Course.findById(foundAssignment.course);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const isEnrolled = course.students.some(
      (studentId) => String(studentId) === String(req.user._id)
    );
    if (!isEnrolled) {
      return res.status(403).json({ message: "You must be enrolled in this course to submit" });
    }

    const existingSubmission = await Submission.findOne({
      assignment,
      student: req.user._id,
    });

    if (existingSubmission) {
      return res.status(400).json({ message: "You already submitted this assignment" });
    }

    const submission = await Submission.create({
      assignment,
      student: req.user._id,
      content,
    });

    res.status(201).json({
      message: "Assignment submitted successfully",
      submission,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSubmissionsByStudent = async (req, res) => {
  try {
    if (
      req.user.role === "student" &&
      String(req.user._id) !== String(req.params.studentId)
    ) {
      return res.status(403).json({ message: "You can only view your own submissions" });
    }

    const submissions = await Submission.find({ student: req.params.studentId })
      .populate({
        path: "assignment",
        populate: { path: "course", select: "code title professor" },
      })
      .populate("student", "name email");

    res.status(200).json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProfessorSubmissions = async (req, res) => {
  try {
    const { courseId } = req.query;

    if (!courseId) {
      return res.status(400).json({ message: "courseId is required" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (String(course.professor) !== String(req.user._id)) {
      return res.status(403).json({
        message: "You can only view submissions for your assigned courses",
      });
    }

    const assignments = await Assignment.find({ course: courseId }).select("_id");
    const assignmentIds = assignments.map((a) => a._id);

    const submissions = await Submission.find({
      assignment: { $in: assignmentIds },
    })
      .populate({
        path: "assignment",
        populate: { path: "course", select: "code title" },
      })
      .populate("student", "name email");

    res.status(200).json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  submitAssignment,
  getSubmissionsByStudent,
  getProfessorSubmissions,
};