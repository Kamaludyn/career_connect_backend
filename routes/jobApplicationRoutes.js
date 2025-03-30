const express = require("express");
const {
  applyForJob,
  reviewJobApplication,
  getJobApplicationsForJob,
  getJobsAppliedByApplicant,
} = require("../controllers/jobApplicationController");
const verifyToken = require("../middleware/verifyToken");
const { verifyEmployer } = require("../middleware/verifyRole");

const router = express.Router();

// @desc    Apply for a job
// @route   POST /api/applications/:jobId/apply
// @access  Private (Students and Mentors only)
router.post("/:jobId", verifyToken, applyForJob);

// @desc    Review job application
// @route   PUT /api/applications
// @access  Private (Employers only)
router.put(
  "/applications/:applicationId/review",
  verifyToken,
  verifyEmployer,
  reviewJobApplication
);

// @desc    Fetches all job applications for a specific job posting
// @route   GET /api/applications/:jobId/applications
// @access  Private (Employers only)
router.get(
  "/:jobId/applications",
  verifyToken,
  verifyEmployer,
  getJobApplicationsForJob
);

// @desc    Fetches all jobs applied by applicant
// @route   GET /api/applications/applied
// @access  Private (students and mentors only)
router.get("/applied", verifyToken, getJobsAppliedByApplicant);

module.exports = router;
