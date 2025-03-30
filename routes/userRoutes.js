const express = require("express");
const {
  getUsers,
  getMentors,
  getUserById,
  getUserCount,
  updateUser,
  deleteUser,
} = require("../controllers/userController");
const verifyToken = require("../middleware/verifyToken");
const { verifyAdmin } = require("../middleware/verifyRole");

const router = express.Router();

// @desc    Get all user
// @route   GET /api/users
// @access  Public
router.get("/", getUsers);

// @desc    Get all Mentors
// @route   GET /api/users/mentors
// @access  Public
router.get("/mentors", getMentors);

// @desc    Get a single user by id
// @route   GET /api/users/:id
// @access  Private
router.get("/:id", verifyToken, getUserById);

// @desc    Get all users count
// @route   GET /api/users/count
// @access  Private
router.get("/count", verifyAdmin, getUserCount);

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private (Self or Admin only)
router.put("/:id", verifyToken, updateUser);

// @desc    Delete user
// @route   DELETE /api/users
// @access  Private (Admin only)
router.delete("/:id", verifyToken, verifyAdmin, deleteUser);

module.exports = router;
