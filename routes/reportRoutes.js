const express = require("express");
const { submitReport, getReports, updateReportStatus } = require("../controllers/reportController");
const { verifyAdmin } = require("../middleware/verifyRole");
const verifyToken = require("../middleware/verifyToken");
const router = express.Router();

// @desc    Submit a report
// @route   POST /api/reports
// @access  Private 
router.post("/", verifyToken, submitReport);

// @desc    Get all reports
// @route   GET /api/reports
// @access  Private (Admin Only)
router.get("/", verifyAdmin, getReports);

// @desc    Update report status
// @route   PUT /api/reports
// @access  Private (Admin Only)
router.put("/:id", verifyAdmin, updateReportStatus);

module.exports = router;
