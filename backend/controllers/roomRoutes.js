const express = require("express");
const { getRooms, getRoomById, createRoom, updateRoom, deleteRoom } = require("../controllers/roomController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const router = express.Router();

router.get("/", protect, getRooms);
router.get("/:id", protect, getRoomById);
router.post("/", protect, authorizeRoles("admin"), createRoom);
router.put("/:id", protect, authorizeRoles("admin"), updateRoom);
router.delete("/:id", protect, authorizeRoles("admin"), deleteRoom);

module.exports = router;