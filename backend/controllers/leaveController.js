const LeaveRequest = require("../models/LeaveRequest");

const getMyLeaves = async (req, res) => {
  try {
    const leaves = await LeaveRequest.find({ staff: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(leaves);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getAllLeaves = async (req, res) => {
  try {
    const leaves = await LeaveRequest.find()
      .populate("staff", "name email role")
      .populate("reviewedBy", "name")
      .sort({ createdAt: -1 });
    res.status(200).json(leaves);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const createLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;
    if (!leaveType || !startDate || !endDate || !reason)
      return res.status(400).json({ message: "All fields required" });
    const leave = await LeaveRequest.create({ staff: req.user._id, leaveType, startDate, endDate, reason });
    res.status(201).json({ message: "Leave request submitted", leave });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const reviewLeave = async (req, res) => {
  try {
    const { status, reviewNote } = req.body;
    const leave = await LeaveRequest.findByIdAndUpdate(
      req.params.id,
      { status, reviewedBy: req.user._id, reviewNote },
      { new: true }
    );
    if (!leave) return res.status(404).json({ message: "Not found" });
    res.status(200).json({ message: "Leave reviewed", leave });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { getMyLeaves, getAllLeaves, createLeave, reviewLeave };