const PayrollRecord = require("../models/PayrollRecord");

const getMyPayroll = async (req, res) => {
  try {
    const records = await PayrollRecord.find({ staff: req.user._id }).sort({ month: -1 });
    res.status(200).json(records);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const getAllPayroll = async (req, res) => {
  try {
    const records = await PayrollRecord.find()
      .populate("staff", "name email role")
      .sort({ month: -1 });
    res.status(200).json(records);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const createPayroll = async (req, res) => {
  try {
    const { staff, month, baseSalary, bonus, deductions, notes } = req.body;
    if (!staff || !month || !baseSalary) return res.status(400).json({ message: "staff, month, baseSalary required" });
    const netSalary = Number(baseSalary) + Number(bonus || 0) - Number(deductions || 0);
    const record = await PayrollRecord.create({ staff, month, baseSalary, bonus, deductions, netSalary, notes });
    res.status(201).json({ message: "Payroll record created", record });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const markPaid = async (req, res) => {
  try {
    const record = await PayrollRecord.findByIdAndUpdate(
      req.params.id,
      { status: "paid", paidAt: new Date() },
      { new: true }
    );
    if (!record) return res.status(404).json({ message: "Not found" });
    res.status(200).json({ message: "Marked as paid", record });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = { getMyPayroll, getAllPayroll, createPayroll, markPaid };