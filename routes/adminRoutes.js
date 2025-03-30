const express = require("express");
const {
  registerAdmin,
  loginAdmin,
  logoutAdmin,
  getAdminProfile,
} = require("../controllers/adminController");
const { verifyAdmin } = require("../middleware/verifyRole");

const router = express.Router();

// @desc    Register New Admin
// @route   POST /api/admin/register
// @access  Private
router.post("/register", verifyAdmin, registerAdmin);

// @desc    Admin Login
// @route   POST /api/admin/login
// @access  Private
router.post("/login", loginAdmin);

// @desc    Admin Logout
// @route   POST /api/admin/logout
// @access  Private
router.post("/logout", logoutAdmin);

// @desc    Admin Profile
// @route   POST /api/admin/profile
// @access  Private
router.get("/profile", verifyAdmin, getAdminProfile);

module.exports = router;
