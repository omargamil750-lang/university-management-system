const express = require("express");
const { getMyBookings, getAllBookings, getBookingsByRoom, createBooking, updateBookingStatus, cancelBooking } = require("../controllers/bookingController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const router = express.Router();

router.get("/my", protect, getMyBookings);
router.get("/", protect, authorizeRoles("admin"), getAllBookings);
router.get("/room/:roomId", protect, getBookingsByRoom);
router.post("/", protect, createBooking);
router.put("/:id/status", protect, authorizeRoles("admin"), updateBookingStatus);
router.put("/:id/cancel", protect, cancelBooking);

module.exports = router;