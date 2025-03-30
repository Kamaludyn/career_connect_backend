const express = require("express");
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateProfile,
  logoutUser,
} = require("../controllers/authController");
const verifyToken = require("../middleware/verifyToken");

const router = express.Router();

// @desc    Register New User
// @route   POST /api/auth/register
// @access  Public
router.post("/register", registerUser);

// @desc    Login User
// @route   POST /api/auth/login
// @access  Public
router.post("/login", loginUser);

// @desc    Get User Profile
// @route   POST /api/auth/profile
// @access  Private
router.get("/profile", verifyToken, getUserProfile);

// @desc    Update User Profile
// @route   PATCH /api/auth/profile
// @access  Private
router.patch("/profile", verifyToken, updateProfile);

// @desc    Logout User
// @route   POST /api/auth/logout
// @access  Public
router.post("/logout", logoutUser);
module.exports = router;
