const StaffProfile = require("../models/StaffProfile");
const User = require("../models/User");

const getAllStaff = async (req, res) => {
  try {
    const profiles = await StaffProfile.find()
      .populate("user", "name email role")
      .sort({ createdAt: -1 });
    res.status(200).json(profiles);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getStaffById = async (req, res) => {
  try {
    const profile = await StaffProfile.findOne({ user: req.params.userId })
      .populate("user", "name email role");
    if (!profile) return res.status(404).json({ message: "Staff profile not found" });
    res.status(200).json(profile);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const createOrUpdateProfile = async (req, res) => {
  try {
    const existing = await StaffProfile.findOne({ user: req.user._id });
    if (existing) {
      Object.assign(existing, req.body);
      await existing.save();
      return res.status(200).json({ message: "Profile updated", profile: existing });
    }
    const profile = await StaffProfile.create({ ...req.body, user: req.user._id });
    res.status(201).json({ message: "Profile created", profile });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getMyProfile = async (req, res) => {
  try {
    const profile = await StaffProfile.findOne({ user: req.user._id }).populate("user", "name email role");
    res.status(200).json(profile || {});
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { getAllStaff, getStaffById, createOrUpdateProfile, getMyProfile };