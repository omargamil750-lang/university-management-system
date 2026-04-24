const express = require("express");
const { getMyApplication, getAllApplications, submitApplication, reviewApplication } = require("../controllers/admissionController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const router = express.Router();

router.get("/my", protect, getMyApplication);
router.get("/", protect, authorizeRoles("admin"), getAllApplications);
router.post("/", protect, submitApplication);
router.put("/:id/review", protect, authorizeRoles("admin"), reviewApplication);

module.exports = router;