const express = require("express");
const { getEvents, getEventById, createEvent, updateEvent, deleteEvent, rsvpEvent } = require("../controllers/eventController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const router = express.Router();

router.get("/", protect, getEvents);
router.get("/:id", protect, getEventById);
router.post("/", protect, authorizeRoles("admin", "professor"), createEvent);
router.put("/:id", protect, authorizeRoles("admin", "professor"), updateEvent);
router.delete("/:id", protect, authorizeRoles("admin"), deleteEvent);
router.post("/:id/rsvp", protect, rsvpEvent);

module.exports = router;