const Notification = require("../models/notificationModel");

// Get all notifications for logged-in user
const getNotifications = async (req, res) => {
  try {
    // Fetches all notifications belonging to the authenticated user
    const notifications = await Notification.find({ user: req.user.id }).sort({
      createdAt: -1, // Sort by latest notifications first
    });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Mark a specific notification as read
const markAsRead = async (req, res) => {
  try {
    // Finds a notification by its ID
    const notification = await Notification.findById(req.params.id);

    // If notification does not exist or does not belong to the user, return an error
    if (!notification || notification.user.toString() !== req.user.id) {
      return res.status(404).json({ message: "Notification not found" });
    }
    notification.isRead = true; // Mark notification as read
    await notification.save(); // Save changes
    res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    // Updates all unread notifications for the logged-in user
    await Notification.updateMany(
      { user: req.user.id, isRead: false }, // Target unread notifications only
      { $set: { isRead: true } }  // Update to read
    );
    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete a specific notification
const deleteNotification = async (req, res) => {
  try {
    // Finds a notification by ID
    const notification = await Notification.findById(req.params.id);

     // If notification does not exist or does not belong to the user, return an error
    if (!notification || notification.user.toString() !== req.user.id) {
      return res.status(404).json({ message: "Notification not found" });
    }
    
    // Delete the notification
    await notification.deleteOne();
    res.status(200).json({ message: "Notification deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Clear all notifications for a user
const clearNotifications = async (req, res) => {
  try {
    // Remove all notifications for the user
    await Notification.deleteMany({ user: req.user.id });
    res.status(200).json({ message: "All notifications cleared" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearNotifications,
};
