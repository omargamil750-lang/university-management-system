const express = require("express");
const { getMyProfile, createOrUpdateProfile, addChild, getChildGrades, getChildCourses } = require("../controllers/parentController");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/me", protect, getMyProfile);
router.post("/me", protect, createOrUpdateProfile);
router.post("/add-child", protect, addChild);
router.get("/child/:studentId/grades", protect, getChildGrades);
router.get("/child/:studentId/courses", protect, getChildCourses);

module.exports = router;