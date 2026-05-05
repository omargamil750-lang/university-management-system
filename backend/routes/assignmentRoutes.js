const express = require("express");
const {
  createAssignment,
  getAssignmentsByCourse,
  deleteAssignment,
} = require("../controllers/assignmentController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/course/:courseId", protect, getAssignmentsByCourse);
router.post("/", protect, authorizeRoles("professor"), createAssignment);
router.delete("/:id", protect, authorizeRoles("professor"), deleteAssignment);

module.exports = router;