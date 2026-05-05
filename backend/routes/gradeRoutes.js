const express = require("express");
const { gradeSubmission, getGradesByStudent, getGradesByCourse } = require("../controllers/gradeController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/", protect, authorizeRoles("professor"), gradeSubmission);
router.get("/student/:studentId", protect, getGradesByStudent);
router.get("/course/:courseId", protect, authorizeRoles("professor", "admin"), getGradesByCourse);

module.exports = router;