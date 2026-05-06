const express = require("express");
const { getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } = require("../controllers/announcementUniversityController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const router = express.Router();

router.get("/", protect, getAnnouncements);
router.post("/", protect, authorizeRoles("admin", "professor"), createAnnouncement);
router.put("/:id", protect, authorizeRoles("admin", "professor"), updateAnnouncement);
router.delete("/:id", protect, authorizeRoles("admin"), deleteAnnouncement);

module.exports = router;