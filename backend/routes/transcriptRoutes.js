const express = require("express");
const { getMyRequests, getAllRequests, createRequest, updateStatus, generateTranscript } = require("../controllers/transcriptController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const router = express.Router();

router.get("/my", protect, getMyRequests);
router.get("/", protect, authorizeRoles("admin"), getAllRequests);
router.post("/", protect, authorizeRoles("student"), createRequest);
router.put("/:id/status", protect, authorizeRoles("admin"), updateStatus);
router.get("/generate/:studentId", protect, generateTranscript);

module.exports = router;