const Job = require("../models/jobModel");
const User = require("../models/userModel");
const JobApplication = require("../models/jobApplicationModel");
const Notification = require("../models/notificationModel");

// Apply for a Job
const applyForJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const applicantId = req.user.id;

    // Restrict employers from applying
    if (req.user.role === "employer") {
      return res
        .status(403)
        .json({ message: "Employers cannot apply for a job" });
    }

    // Mentors can only apply if they are "Unavailable"
    if (req.user.role === "mentor" && req.user.availability !== false) {
      return res.status(403).json({
        message:
          "Mentors cannot apply for jobs if they are available for mentorship",
      });
    }

    // Check if the job exist
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Check if the applicant has already applied
    const existingApplication = await JobApplication.findOne({
      job: jobId,
      applicant: applicantId,
    });

    if (existingApplication) {
      return res
        .status(200)
        .json({ message: "You have already applied for this job" });
    }

    const application = new JobApplication({
      job: jobId,
      applicant: applicantId,
    });

    application.save();

    // Notify the employer
    await Notification.create({
      user: job.postedBy, //Notify the job poster(employer)
      message: `New job application for ${job.title}`,
      type: "job",
      relatedId: application.id, // Links to the job application
    });

    res.status(201).json({ message: "Job application submitted successfully" });
  } catch (error) {
    res.status(500).json({ message: "server error", error: error.message });
  }
};

// Review and respond to job applications
const reviewJobApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body; // accepted or rejected
    const employerId = req.user.id;

    // Check if status is valid
    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value." });
    }

    // Find job application
    const application = await JobApplication.findById(applicationId).populate(
      "job"
    );
    if (!application) {
      return res.status(404).json({ message: "Job application not found." });
    }

    // Ensure the employer owns the job posting
    if (application.job.postedBy.toString() !== employerId) {
      return res
        .status(403)
        .json({ message: "Unauthorized to review this application." });
    }

    // Update application status
    application.status = status;
    await application.save();

    // Notify the applicant
    await Notification.create({
      user: application.applicant, // Notify the applicant
      message: `Your application for "${application.job.title}" has been ${status}.`,
      type: "job",
      relatedId: application._id,
    });

    res.status(200).json({ message: `Application ${status} successfully.` });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get a all jobs application for a job posting
const getJobApplicationsForJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const employerId = req.user.id;

    // Find the job and check if the employer owns it
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found." });
    }

    if (job.postedBy.toString() !== employerId) {
      return res
        .status(403)
        .json({ message: "Unauthorized to view applications for this job." });
    }

    // Fetch job applications
    const applications = await JobApplication.find({ job: jobId })
      .populate("applicant", "surname othername email") // Get applicant details
      .sort({ createdAt: -1 });

    res.status(200).json({ applications });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all jobs applied to by an logged-in applicant
const getJobsAppliedByApplicant = async (req, res) => {
  try {
    const applicantId = req.user.id;

    // Fetch all job applications made by this applicant
    const applications = await JobApplication.find({ applicant: applicantId })
      .populate("job", "title company location type") // Get job details
      .sort({ createdAt: -1 });

    res.status(200).json({ applications });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  applyForJob,
  reviewJobApplication,
  getJobApplicationsForJob,
  getJobsAppliedByApplicant,
};
