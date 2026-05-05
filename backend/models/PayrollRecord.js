const mongoose = require("mongoose");

const payrollSchema = new mongoose.Schema({
  staff: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  month: { type: String, required: true }, // "2025-01"
  baseSalary: { type: Number, required: true },
  bonus: { type: Number, default: 0 },
  deductions: { type: Number, default: 0 },
  netSalary: { type: Number, required: true },
  status: { type: String, enum: ["pending", "paid"], default: "pending" },
  paidAt: { type: Date, default: null },
  notes: { type: String, default: "" },
}, { timestamps: true });

module.exports = mongoose.model("PayrollRecord", payrollSchema);