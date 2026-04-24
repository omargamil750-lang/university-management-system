const mongoose = require("mongoose");

const admissionSchema = new mongoose.Schema({
  applicant: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  program: { type: String, required: true },
  previousInstitution: { type: String, default: "" },
  gpa: { type: Number, default: 0 },
  statementOfPurpose: { type: String, default: "" },
  status: { type: String, enum: ["submitted", "under_review", "accepted", "rejected", "waitlisted"], default: "submitted" },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  reviewNotes: { type: String, default: "" },
  documents: [{ name: String, url: String }],
}, { timestamps: true });

module.exports = mongoose.model("AdmissionApplication", admissionSchema);