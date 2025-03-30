const Mentorship = require("../models/mentorshipModel");
const User = require("../models/userModel");
const Notification = require("../models/notificationModel");

// @desc    Send a mentorship request
const sendMentorshipRequest = async (req, res) => {
  try {
    const { message } = req.body;
    const { mentorId } = req.params;
    const menteeId = req.user.id;

    if (!message) {
      return res.status(400).json({ message: "Request message is required" });
    }

    if (req.user.role !== "student") {
      return res
        .status(403)
        .json({ message: "Only Students can Request For Mentorship" });
    }

    // check if mentor exists
    const mentor = await User.findById(mentorId);
    if (!mentor) {
      return res.status(404).json({ message: "Mentor not found" });
    }

    // Check if request already exists
    const existingRequest = await Mentorship.findOne({
      mentee: menteeId,
      mentor: mentorId,
      status: "pending",
    });

    if (existingRequest) {
      return res.status(400).json({ message: "Request already sent" });
    }

    // Create a new mentorship request
    const mentorshipRequest = new Mentorship({
      mentee: menteeId,
      mentor: mentorId,
      message,
    });

    await mentorshipRequest.save();

    await Notification.create({
      user: mentorId, // Notify the mentor
      message: `${req.user.othername} ${req.user.surname} has sent you a mentorship request.`,
      type: "mentorship",
      relatedId: mentorshipRequest._id, // Links to the request
    });

    res.status(201).json({ message: "Mentorship request sent" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get mentorship requests (both sent & received)
const getMentorshipRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch requests where user is either a mentee or mentor
    const mentorships = await Mentorship.find({
      $or: [{ mentee: userId }, { mentor: userId }],
    })
      .populate(
        "mentee",
        "othername surname email bio skills department level certifications role"
      )
      .populate("mentor", "othername surname email")
      .sort({ createdAt: -1 });

    res.status(200).json(mentorships);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Accept a mentorship request
const acceptMentorshipRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id;

    const mentorship = await Mentorship.findById(requestId);
    if (!mentorship) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Ensure only the mentor can accept the request
    if (mentorship.mentor.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    mentorship.status = "accepted";
    mentorship.acceptedAt = new Date();
    await mentorship.save();

    await Notification.create({
      user: mentorship.mentee, // Notify the student
      message: "Congratulations, your mentorship request has been accepted!",
      type: "mentorship",
      relatedId: mentorship._id, // Links to the mentorship request
    });

    res.status(200).json({ message: "Mentorship request accepted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Reject a mentorship request
const rejectMentorshipRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id;

    // Find mentorship
    const mentorship = await Mentorship.findById(requestId);
    if (!mentorship) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Ensure only the mentor can reject the request
    if (mentorship.mentor.toString() !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Update mentorship status to "rejected" and save
    mentorship.status = "rejected";
    await mentorship.save();

    // Notify student
    await Notification.create({
      user: mentorship.mentee, //Notify the student
      message: "Sorry, your mentorship request has been rejected!",
      type: "mentorship",
      relatedId: mentorship._id,
    });

    res.status(200).json({ message: "Mentorship request rejected" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  sendMentorshipRequest,
  getMentorshipRequests,
  acceptMentorshipRequest,
  rejectMentorshipRequest,
};
