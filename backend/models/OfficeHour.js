const mongoose = require("mongoose");

const officeHourSchema = new mongoose.Schema({
  staff: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  dayOfWeek: { type: String, enum: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"], required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  location: { type: String, default: "" },
  isVirtual: { type: Boolean, default: false },
  meetingLink: { type: String, default: "" },
  notes: { type: String, default: "" },
}, { timestamps: true });

module.exports = mongoose.model("OfficeHour", officeHourSchema);