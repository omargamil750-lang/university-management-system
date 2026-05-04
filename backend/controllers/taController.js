const User = require("../models/User");
const Course = require("../models/Course");
const OfficeHour = require("../models/OfficeHour");
const Assignment = require("../models/Assignment");
const Submission = require("../models/Submission");

// Get all TAs
const getAllTAs = async (req, res) => {
  try {
    const tas = await User.find({ role: "ta" }).select("name email role");
    res.status(200).json(tas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get TA profile with office hours
const getTAProfile = async (req, res) => {
  try {
    const ta = await User.findById(req.params.id).select("-password");
    if (!ta || ta.role !== "ta") {
      return res.status(404).json({ message: "TA not found" });
    }
    const officeHours = await OfficeHour.find({ staff: ta._id });
    res.status(200).json({ ta, officeHours });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Assign TA to a course (admin)
const assignTACourse = async (req, res) => {
  try {
    const { courseId, taId } = req.body;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const ta = await User.findById(taId);
    if (!ta || ta.role !== "ta") {
      return res.status(400).json({ message: "Invalid TA" });
    }

    if (!course.assistants) course.assistants = [];
    if (course.assistants.map(String).includes(String(taId))) {
      return res.status(400).json({ message: "TA already assigned to this course" });
    }

    course.assistants.push(taId);
    await course.save();

    res.status(200).json({ message: "TA assigned to course", course });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove TA from course
const removeTACourse = async (req, res) => {
  try {
    const { courseId, taId } = req.body;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    course.assistants = (course.assistants || []).filter(
      (id) => String(id) !== String(taId)
    );
    await course.save();

    res.status(200).json({ message: "TA removed from course" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get courses assigned to a TA
const getTACourses = async (req, res) => {
  try {
    const courses = await Course.find({ assistants: req.user._id })
      .populate("professor", "name email")
      .populate("students", "name email")
      .populate("assistants", "name email role");
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// TA can view submissions for their assigned courses
const getTASubmissions = async (req, res) => {
  try {
    const { courseId } = req.query;
    if (!courseId) return res.status(400).json({ message: "courseId required" });

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const isTA = (course.assistants || []).map(String).includes(String(req.user._id));
    if (!isTA && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized for this course" });
    }

    const assignments = await Assignment.find({ course: courseId }).select("_id");
    const assignmentIds = assignments.map((a) => a._id);

    const submissions = await Submission.find({ assignment: { $in: assignmentIds } })
      .populate({ path: "assignment", populate: { path: "course", select: "code title" } })
      .populate("student", "name email");

    res.status(200).json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllTAs,
  getTAProfile,
  assignTACourse,
  removeTACourse,
  getTACourses,
  getTASubmissions,
};