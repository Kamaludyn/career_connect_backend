const express = require("express");
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearNotifications,
} = require("../controllers/notificationController");
const verifyToken = require("../middleware/verifyToken");

const router = express.Router();

// @desc    Get notifications
// @route   GET /api/notifications
// @access  Private
router.get("/", verifyToken, getNotifications);

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
router.put("/:id/read", verifyToken, markAsRead);

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
router.put("/read-all", verifyToken, markAllAsRead);

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
router.delete("/:id", verifyToken, deleteNotification);

// @desc    clear all Notifications
// @route   DELETE /api/notifications/clear
// @access  Private
router.delete("/clear", verifyToken, clearNotifications);

module.exports = router;
