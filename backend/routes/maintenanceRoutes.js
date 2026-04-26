const express = require("express");
const { getRequests, getMyRequests, createRequest, updateStatus } = require("../controllers/maintenanceController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const router = express.Router();

router.get("/", protect, authorizeRoles("admin"), getRequests);
router.get("/my", protect, getMyRequests);
router.post("/", protect, createRequest);
router.put("/:id/status", protect, authorizeRoles("admin"), updateStatus);

module.exports = router;