const PerformanceRecord = require("../models/PerformanceRecord");

const getMyPerformance = async (req, res) => {
  try {
    const records = await PerformanceRecord.find({ staff: req.user._id })
      .populate("reviewedBy", "name")
      .sort({ createdAt: -1 });
    res.status(200).json(records);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getAllPerformance = async (req, res) => {
  try {
    const records = await PerformanceRecord.find()
      .populate("staff", "name email")
      .populate("reviewedBy", "name")
      .sort({ createdAt: -1 });
    res.status(200).json(records);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const createReview = async (req, res) => {
  try {
    const { staff, period, teachingScore, researchScore, serviceScore, comments, goals } = req.body;
    if (!staff || !period) return res.status(400).json({ message: "staff and period required" });
    const overall = ((Number(teachingScore) + Number(researchScore) + Number(serviceScore)) / 3).toFixed(1);
    const record = await PerformanceRecord.create({
      staff, reviewedBy: req.user._id, period,
      teachingScore, researchScore, serviceScore,
      overallScore: overall, comments, goals
    });
    res.status(201).json({ message: "Review created", record });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { getMyPerformance, getAllPerformance, createReview };