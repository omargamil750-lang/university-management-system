const express = require("express");
const { getMyPerformance, getAllPerformance, createReview } = require("../controllers/performanceController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const router = express.Router();

router.get("/my", protect, getMyPerformance);
router.get("/", protect, authorizeRoles("admin"), getAllPerformance);
router.post("/", protect, authorizeRoles("admin"), createReview);

module.exports = router;