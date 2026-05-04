const express = require("express");
const {
  getAllTAs,
  getTAProfile,
  assignTACourse,
  removeTACourse,
  getTACourses,
  getTASubmissions,
} = require("../controllers/taController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/", protect, getAllTAs);
router.get("/my-courses", protect, authorizeRoles("ta"), getTACourses);
router.get("/submissions", protect, authorizeRoles("ta", "admin"), getTASubmissions);
router.get("/:id", protect, getTAProfile);
router.post("/assign", protect, authorizeRoles("admin"), assignTACourse);
router.post("/remove", protect, authorizeRoles("admin"), removeTACourse);

module.exports = router;