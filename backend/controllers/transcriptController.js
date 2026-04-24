const TranscriptRequest = require("../models/TranscriptRequest");
const Grade = require("../models/Grade");
const Course = require("../models/Course");
const User = require("../models/User");

const getMyRequests = async (req, res) => {
  try {
    const requests = await TranscriptRequest.find({ student: req.user._id })
      .populate("processedBy", "name")
      .sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getAllRequests = async (req, res) => {
  try {
    const requests = await TranscriptRequest.find()
      .populate("student", "name email")
      .populate("processedBy", "name")
      .sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const createRequest = async (req, res) => {
  try {
    const { purpose, deliveryMethod } = req.body;
    if (!purpose) return res.status(400).json({ message: "Purpose is required" });
    const request = await TranscriptRequest.create({
      student: req.user._id, purpose, deliveryMethod,
    });
    res.status(201).json({ message: "Transcript request submitted", request });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const updateStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const request = await TranscriptRequest.findByIdAndUpdate(
      req.params.id,
      { status, notes, processedBy: req.user._id },
      { new: true }
    );
    if (!request) return res.status(404).json({ message: "Not found" });
    res.status(200).json({ message: "Status updated", request });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const generateTranscript = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const student = await User.findById(studentId).select("-password");
    if (!student) return res.status(404).json({ message: "Student not found" });

    const grades = await Grade.find({ student: studentId })
      .populate("course", "code title creditHours type")
      .populate("assignment", "title");

    const enrolledCourses = await Course.find({ students: studentId })
      .populate("professor", "name");

    const gpa = grades.length > 0
      ? (grades.reduce((s, g) => s + g.grade, 0) / grades.length).toFixed(2)
      : "0.00";

    res.status(200).json({
      student: { name: student.name, email: student.email, id: student._id },
      grades,
      enrolledCourses,
      gpa,
      generatedAt: new Date(),
      totalCredits: enrolledCourses.reduce((s, c) => s + (c.creditHours || 0), 0),
    });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { getMyRequests, getAllRequests, createRequest, updateStatus, generateTranscript };