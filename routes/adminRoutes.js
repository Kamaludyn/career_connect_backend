const express = require("express");
const {
  registerAdmin,
  loginAdmin,
  logoutAdmin,
  getAdminProfile,
  getDashboardStats,
  deleteJobAsAdmin,
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

// @desc    Get overview dashboard statistics
// @route   GET /api/admin/count
// @access  Private
router.get("/count", verifyAdmin, getDashboardStats);

// @desc    Delete Job
// @route   GET /api/admin/:id
// @access  Private
router.delete("/jobs/:id", verifyAdmin, deleteJobAsAdmin);

module.exports = router;
