const express = require("express");
const { getOfficeHoursByStaff, getMyOfficeHours, getAllOfficeHours, createOfficeHour, deleteOfficeHour } = require("../controllers/officeHourController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const router = express.Router();

router.get("/", protect, getAllOfficeHours);
router.get("/my", protect, getMyOfficeHours);
router.get("/staff/:staffId", protect, getOfficeHoursByStaff);
router.post("/", protect, authorizeRoles("professor", "ta"), createOfficeHour);
router.delete("/:id", protect, authorizeRoles("professor", "ta", "admin"), deleteOfficeHour);

module.exports = router;