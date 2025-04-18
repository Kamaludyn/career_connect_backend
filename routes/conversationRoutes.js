const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const {
  createOrGetConversation,
  getUserConversations,
} = require("../controllers/conversationController");

// @desc    Get or Create a conversation
// @route   POST /api/conversations
// @access  Private
router.post("/", verifyToken, createOrGetConversation);

// @desc    Get all logged-in user conversations
// @route   GET /api/conversations/:userId
// @access  Private
router.get("/:userId", verifyToken, getUserConversations);

module.exports = router;
