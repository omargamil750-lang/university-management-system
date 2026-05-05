const mongoose = require("mongoose");

const parentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  children: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // student user IDs
  phone: { type: String, default: "" },
  address: { type: String, default: "" },
  relationship: { type: String, enum: ["father", "mother", "guardian"], default: "guardian" },
}, { timestamps: true });

module.exports = mongoose.model("ParentProfile", parentSchema);