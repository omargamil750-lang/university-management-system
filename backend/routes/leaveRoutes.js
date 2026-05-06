const express = require("express");
const { getMyLeaves, getAllLeaves, createLeave, reviewLeave } = require("../controllers/leaveController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const router = express.Router();

router.get("/my", protect, getMyLeaves);
router.get("/", protect, authorizeRoles("admin"), getAllLeaves);
router.post("/", protect, authorizeRoles("professor", "ta", "admin"), createLeave);
router.put("/:id/review", protect, authorizeRoles("admin"), reviewLeave);

module.exports = router;