const express = require("express");
const { getMyPayroll, getAllPayroll, createPayroll, markPaid } = require("../controllers/payrollController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const router = express.Router();

router.get("/my", protect, getMyPayroll);
router.get("/", protect, authorizeRoles("admin"), getAllPayroll);
router.post("/", protect, authorizeRoles("admin"), createPayroll);
router.put("/:id/pay", protect, authorizeRoles("admin"), markPaid);

module.exports = router;