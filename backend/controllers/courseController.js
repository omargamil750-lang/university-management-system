const Course = require("../models/Course");
const User = require("../models/User");

const createCourse = async (req, res) => {
  try {
    const { code, title, type, creditHours, description, professor } = req.body;
    if (!code || !title || !type || !creditHours || !professor)
      return res.status(400).json({ message: "Code, title, type, credit hours, and professor are required" });

    const existing = await Course.findOne({ code });
    if (existing)
      return res.status(400).json({ message: "Course code already exists" });

    const professorUser = await User.findById(professor);
    if (!professorUser || professorUser.role !== "professor")
      return res.status(400).json({ message: "Assigned professor is invalid" });

    const course = await Course.create({ code, title, type, creditHours, description, professor, students: [], assistants: [] });
    res.status(201).json({ message: "Course created successfully", course });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const updateCourse = async (req, res) => {
  try {
    const { code, title, type, creditHours, description, professor } = req.body;
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (!code || !title || !type || !creditHours || !professor)
      return res.status(400).json({ message: "Code, title, type, credit hours, and professor are required" });

    const professorUser = await User.findById(professor);
    if (!professorUser || professorUser.role !== "professor")
      return res.status(400).json({ message: "Assigned professor is invalid" });

    const dup = await Course.findOne({ code, _id: { $ne: req.params.id } });
    if (dup) return res.status(400).json({ message: "Another course already uses this code" });

    Object.assign(course, { code, title, type, creditHours, description, professor });
    await course.save();
    res.status(200).json({ message: "Course updated", course });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const enrollInCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (course.students.map(String).includes(String(req.user._id)))
      return res.status(400).json({ message: "Already enrolled" });

    course.students.push(req.user._id);
    await course.save();

    const updated = await Course.findById(req.params.id)
      .populate("professor", "name email role")
      .populate("students", "name email role")
      .populate("assistants", "name email role");
    res.status(200).json({ message: "Enrolled successfully", course: updated });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const unenrollFromCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (!course.students.map(String).includes(String(req.user._id)))
      return res.status(400).json({ message: "Not enrolled" });

    course.students = course.students.filter((id) => String(id) !== String(req.user._id));
    await course.save();
    res.status(200).json({ message: "Unenrolled successfully" });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate("professor", "name email role")
      .populate("students", "name email role")
      .populate("assistants", "name email role");
    res.status(200).json(courses);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("professor", "name email role")
      .populate("students", "name email role")
      .populate("assistants", "name email role");
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.status(200).json(course);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getMyCourses = async (req, res) => {
  try {
    const courses = await Course.find({ professor: req.user._id })
      .populate("professor", "name email role")
      .populate("students", "name email role")
      .populate("assistants", "name email role");
    res.status(200).json(courses);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getProfessors = async (req, res) => {
  try {
    const professors = await User.find({ role: "professor" }).select("name email role");
    res.status(200).json(professors);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = {
  createCourse, updateCourse, enrollInCourse, unenrollFromCourse,
  getCourses, getCourseById, getMyCourses, getProfessors,
};