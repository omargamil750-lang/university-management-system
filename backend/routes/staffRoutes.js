const express = require("express");
const { getAllStaff, getStaffById, createOrUpdateProfile, getMyProfile } = require("../controllers/staffController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const router = express.Router();

router.get("/", protect, getAllStaff);
router.get("/me", protect, getMyProfile);
router.get("/:userId", protect, getStaffById);
router.post("/", protect, authorizeRoles("professor", "ta", "admin"), createOrUpdateProfile);

module.exports = router;