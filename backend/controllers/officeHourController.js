const OfficeHour = require("../models/OfficeHour");

const getOfficeHoursByStaff = async (req, res) => {
  try {
    const hours = await OfficeHour.find({ staff: req.params.staffId })
      .populate("staff", "name email");
    res.status(200).json(hours);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getMyOfficeHours = async (req, res) => {
  try {
    const hours = await OfficeHour.find({ staff: req.user._id });
    res.status(200).json(hours);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getAllOfficeHours = async (req, res) => {
  try {
    const hours = await OfficeHour.find().populate("staff", "name email role");
    res.status(200).json(hours);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const createOfficeHour = async (req, res) => {
  try {
    const { dayOfWeek, startTime, endTime, location, isVirtual, meetingLink, notes } = req.body;
    if (!dayOfWeek || !startTime || !endTime) return res.status(400).json({ message: "Day, start and end time required" });
    const oh = await OfficeHour.create({ staff: req.user._id, dayOfWeek, startTime, endTime, location, isVirtual, meetingLink, notes });
    res.status(201).json({ message: "Office hour created", oh });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const deleteOfficeHour = async (req, res) => {
  try {
    await OfficeHour.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Deleted" });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { getOfficeHoursByStaff, getMyOfficeHours, getAllOfficeHours, createOfficeHour, deleteOfficeHour };