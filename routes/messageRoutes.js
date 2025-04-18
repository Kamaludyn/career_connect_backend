const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const router = express.Router();
const {
  sendMessage,
  getMessages,
  updateReadStatus,
} = require("../controllers/messageController");

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
router.post("/", sendMessage);

// @desc    Get all messages in a conversation
// @route   GET /api/messages/:conversationId
// @access  Private
router.get("/:conversationId", getMessages);

// @desc    Update the read status of a message
// @route   PATCH /api/messages/:id/read
// @access  Private
router.patch("/:id/read", verifyToken, updateReadStatus);

module.exports = router;
