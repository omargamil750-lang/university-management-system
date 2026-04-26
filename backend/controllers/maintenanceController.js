const MaintenanceRequest = require("../models/MaintenanceRequest");

const getRequests = async (req, res) => {
  try {
    const requests = await MaintenanceRequest.find()
      .populate("room", "name building")
      .populate("reportedBy", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getMyRequests = async (req, res) => {
  try {
    const requests = await MaintenanceRequest.find({ reportedBy: req.user._id })
      .populate("room", "name building")
      .sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const createRequest = async (req, res) => {
  try {
    const { title, description, room, priority } = req.body;
    if (!title || !description) return res.status(400).json({ message: "Title and description required" });
    const request = await MaintenanceRequest.create({ title, description, room, priority, reportedBy: req.user._id });
    res.status(201).json({ message: "Request submitted", request });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const request = await MaintenanceRequest.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!request) return res.status(404).json({ message: "Request not found" });
    res.status(200).json({ message: "Status updated", request });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { getRequests, getMyRequests, createRequest, updateStatus };