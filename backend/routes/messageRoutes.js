const express = require("express");
const {
  getMyThreads,
  getThreadMessages,
  createThread,
  sendMessage,
  deleteThread,
  getUnreadCount,
  getUsers,
} = require("../controllers/messageController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// IMPORTANT: specific routes before param routes
router.get("/users", protect, getUsers);
router.get("/unread", protect, getUnreadCount);
router.get("/threads", protect, getMyThreads);
router.post("/threads", protect, createThread);
router.get("/threads/:threadId", protect, getThreadMessages);
router.post("/threads/:threadId/send", protect, sendMessage);
router.delete("/threads/:threadId", protect, deleteThread);

module.exports = router;