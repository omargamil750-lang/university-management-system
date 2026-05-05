const mongoose = require("mongoose");

const staffProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  department: { type: String, default: "" },
  title: { type: String, default: "" }, // e.g. "Associate Professor"
  bio: { type: String, default: "" },
  phone: { type: String, default: "" },
  officeLocation: { type: String, default: "" },
  researchInterests: [{ type: String }],
  publications: [{ title: String, year: Number, url: String }],
  profileImage: { type: String, default: "" },
}, { timestamps: true });

module.exports = mongoose.model("StaffProfile", staffProfileSchema);