const express = require("express");
const {
  sendMentorshipRequest,
  getMentorshipRequests,
  acceptMentorshipRequest,
  rejectMentorshipRequest,
} = require("../controllers/mentorshipController");
const verifyToken = require("../middleware/verifyToken");

const router = express.Router();

// @desc    Send a mentorship request
// @route   POST /api/mentorships/:mentorId
// @access  Private (students only)
router.post("/:mentorId", verifyToken, sendMentorshipRequest);

// @desc    Get mentorship requests (sent & received)
// @route   GET /api/mentorships
// @access  Private (Both mentors and students)
router.get("/", verifyToken, getMentorshipRequests);

// @desc    Accept a mentorship request
// @route   PUT /api/mentorships/:requestId/accept
// @access  Private (Mentors only)
router.put("/:requestId/accept", verifyToken, acceptMentorshipRequest);

// @desc    Reject a mentorship request
// @route   PUT /api/mentorships/:requestId/reject
// @access  Private (Mentors only)
router.put("/:requestId/reject", verifyToken, rejectMentorshipRequest);

module.exports = router;
