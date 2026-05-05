const express = require("express");
const {
  submitAssignment,
  getSubmissionsByStudent,
  getProfessorSubmissions,
} = require("../controllers/submissionController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/", protect, authorizeRoles("student"), submitAssignment);
router.get("/student/:studentId", protect, getSubmissionsByStudent);
router.get("/professor", protect, authorizeRoles("professor"), getProfessorSubmissions);

module.exports = router;