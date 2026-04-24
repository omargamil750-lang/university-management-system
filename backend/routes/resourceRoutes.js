const express = require("express");
const { getResources, createResource, updateResource, assignResource, deleteResource } = require("../controllers/resourceController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const router = express.Router();

router.get("/", protect, getResources);
router.post("/", protect, authorizeRoles("admin"), createResource);
router.put("/:id", protect, authorizeRoles("admin"), updateResource);
router.post("/:id/assign", protect, authorizeRoles("admin"), assignResource);
router.delete("/:id", protect, authorizeRoles("admin"), deleteResource);

module.exports = router;