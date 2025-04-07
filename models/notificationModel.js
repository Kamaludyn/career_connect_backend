const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        "mentorship_request", // Mentor receives a request
        "mentorship_accepted", // Student gets accepted
        "mentorship_rejected", // Student gets rejected
        "job_application", // Employer receives an application
        "new_job", // New job post
        "application_update", // Job seeker gets an update (hired/rejected)
        "system", // System-wide notifications
        "resource", // Notifications about resources
        "mentorship",
        "job",
      ],
      required: true,
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
    },
    triggeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    isRead: {
      type: Boolean,
      default: false,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
