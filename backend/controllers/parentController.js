const ParentProfile = require("../models/ParentProfile");
const User = require("../models/User");
const Grade = require("../models/Grade");
const Course = require("../models/Course");

const getMyProfile = async (req, res) => {
  try {
    const profile = await ParentProfile.findOne({ user: req.user._id })
      .populate("children", "name email");
    res.status(200).json(profile || {});
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const createOrUpdateProfile = async (req, res) => {
  try {
    const existing = await ParentProfile.findOne({ user: req.user._id });
    if (existing) {
      Object.assign(existing, req.body);
      await existing.save();
      return res.status(200).json({ message: "Profile updated", profile: existing });
    }
    const profile = await ParentProfile.create({ ...req.body, user: req.user._id });
    res.status(201).json({ message: "Profile created", profile });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const addChild = async (req, res) => {
  try {
    const { studentEmail } = req.body;
    const student = await User.findOne({ email: studentEmail, role: "student" });
    if (!student) return res.status(404).json({ message: "Student not found" });
    const profile = await ParentProfile.findOne({ user: req.user._id });
    if (!profile) return res.status(404).json({ message: "Parent profile not found" });
    if (profile.children.map(String).includes(String(student._id)))
      return res.status(400).json({ message: "Student already linked" });
    profile.children.push(student._id);
    await profile.save();
    res.status(200).json({ message: "Child linked", profile });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getChildGrades = async (req, res) => {
  try {
    const profile = await ParentProfile.findOne({ user: req.user._id });
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    if (!profile.children.map(String).includes(req.params.studentId))
      return res.status(403).json({ message: "Not your child" });
    const grades = await Grade.find({ student: req.params.studentId })
      .populate("assignment", "title")
      .populate("course", "code title")
      .populate("professor", "name");
    res.status(200).json(grades);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getChildCourses = async (req, res) => {
  try {
    const profile = await ParentProfile.findOne({ user: req.user._id });
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    if (!profile.children.map(String).includes(req.params.studentId))
      return res.status(403).json({ message: "Not your child" });
    const courses = await Course.find({ students: req.params.studentId })
      .populate("professor", "name email");
    res.status(200).json(courses);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { getMyProfile, createOrUpdateProfile, addChild, getChildGrades, getChildCourses };