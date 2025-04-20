const express = require("express");
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateProfile,
  logoutUser,
  changePassword,
  forgotPassword,
  resetPassword,
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

// @desc    Change Password
// @route   PUT /api/auth/change-password
// @access  Private
router.put("/change-password", verifyToken, changePassword);

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Private
router.post("/forgot-password", forgotPassword);

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Private
router.post("/reset-password/:token", resetPassword);
module.exports = router;
