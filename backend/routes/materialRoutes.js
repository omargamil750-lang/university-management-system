const express = require("express");
const { getMaterialsByCourse, uploadMaterial, deleteMaterial } = require("../controllers/materialController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const router = express.Router();

router.get("/course/:courseId", protect, getMaterialsByCourse);
router.post("/", protect, authorizeRoles("professor", "admin"), uploadMaterial);
router.delete("/:id", protect, authorizeRoles("professor", "admin"), deleteMaterial);

module.exports = router;