const express = require("express");
const { getAnnouncementsByCourse, createAnnouncement, updateAnnouncement, deleteAnnouncement } = require("../controllers/announcementController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const router = express.Router();

router.get("/course/:courseId", protect, getAnnouncementsByCourse);
router.post("/", protect, authorizeRoles("professor", "admin"), createAnnouncement);
router.put("/:id", protect, authorizeRoles("professor", "admin"), updateAnnouncement);
router.delete("/:id", protect, authorizeRoles("professor", "admin"), deleteAnnouncement);

module.exports = router;