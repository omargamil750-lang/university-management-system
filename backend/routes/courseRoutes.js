const express = require("express");
const {
  createCourse,
  updateCourse,
  enrollInCourse,
  unenrollFromCourse,
  getCourses,
  getCourseById,
  getMyCourses,
  getProfessors,
} = require("../controllers/courseController");

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/", protect, getCourses);
router.get("/my-courses", protect, authorizeRoles("professor"), getMyCourses);
router.get("/professors/list", protect, authorizeRoles("admin"), getProfessors);

router.post("/", protect, authorizeRoles("admin"), createCourse);
router.put("/:id", protect, authorizeRoles("admin"), updateCourse);
router.post("/:id/enroll", protect, authorizeRoles("student"), enrollInCourse);
router.post("/:id/unenroll", protect, authorizeRoles("student"), unenrollFromCourse);

router.get("/:id", protect, getCourseById);

module.exports = router;