const express = require("express");
const {
  createJob,
  getAllJobs,
  getMyJobs,
  getJob,
  getJobsCount,
  updateJob,
  deleteJob,
} = require("../controllers/jobController");
const verifyToken = require("../middleware/verifyToken");
const { verifyEmployer, verifyAdmin } = require("../middleware/verifyRole");

const router = express.Router();

// @desc    Create a new job posting
// @route   POST /api/jobs
// @access  Private (Employers only)
router.post("/", verifyToken, verifyEmployer, createJob);

// @desc    Get all jobs
// @route   GET /api/jobs/
// @access  Public
router.get("/", getAllJobs);

// @desc    Get all jobs posted by a specific employer
// @route   GET /api/jobs/my-jobs
// @access  Private (Employers only)
router.get("/my-jobs", verifyToken, verifyEmployer, getMyJobs);

// @desc    Get a single job
// @route   GET /api/jobs/:id
// @access  Public
router.get("/:id", getJob);

// @desc    Get a single job
// @route   GET /api/jobs/count
// @access  Private (Admin Only)
router.get("/count", verifyToken, verifyAdmin, getJobsCount);

// @desc    Delete a job
// @route   PUT /api/jobs/:id
// @access  Privavte (Employers & Admins)
router.put("/:id", verifyToken, updateJob);

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Privavte (Employers & Admins)
router.delete("/:id", verifyToken, deleteJob);

module.exports = router;
