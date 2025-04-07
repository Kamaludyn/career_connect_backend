const Job = require("../models/jobModel");
const User = require("../models/userModel");
const Admin = require("../models/adminModel");
const Notification = require("../models/notificationModel");
const JobApplication = require("../models/jobApplicationModel");

// Create Job
const createJob = async (req, res) => {
  try {
    const {
      title,
      company,
      description,
      location,
      locationDetails,
      type,
      experienceLevel,
      minSalary,
      maxSalary,
      currency,
      applicationMethod,
      applicationLink,
    } = req.body;
    const userId = req.user.id;

    if (!userId) {
      return res.status(400).json({ error: "Missing user ID" });
    }

    // Basic validations
    if (
      !title ||
      !company ||
      !description ||
      !type ||
      !experienceLevel ||
      !minSalary ||
      !maxSalary ||
      !currency
    ) {
      return res
        .status(400)
        .json({ message: "Please fill in all required fields." });
    }

    if (applicationMethod !== "careerconnect" && !applicationLink) {
      return res.status(400).json({
        message:
          "Application link or email is required for this application method.",
      });
    }
    if (location !== "Remote" && !locationDetails) {
      return res.status(400).json({
        message: "Job location must be provided.",
      });
    }

    // Create new job
    const job = new Job({
      title,
      company,
      description,
      location,
      locationDetails,
      type,
      experienceLevel,
      minSalary,
      maxSalary,
      currency,
      applicationMethod,
      applicationLink,
      postedBy: userId,
    });

    const createdJob = await job.save();

    const students = await User.find({ role: "student" }); // Find all students

    await Promise.all(
      students.map((student) =>
        Notification.create({
          user: student._id, // Notify all students
          message: `New job posted: ${job.title}`,
          type: "new_job",
          relatedId: job._id, // Links to the job posting
          triggeredBy: userId, // The employer who triggered the notification
        })
      )
    );

    // Add job to employer's postedJobs array
    await User.findByIdAndUpdate(userId, { $push: { postedJobs: job._id } });
    res.status(201).json(createdJob);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all Jobs
const getAllJobs = async (req, res) => {
  try {
    const allJobs = await Job.find()
      .populate("postedBy", "name email")
      .sort({ createdAt: -1 }); // Sort by newest first;
    res.status(200).json(allJobs);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//   Get a Single Job by Id
const getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.status(200).json(job);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all Jobs Posted by a Specific Employer
const getMyJobs = async (req, res) => {
  try {
    const userId = req.user.id;
    const jobs = await Job.find({ postedBy: userId }).sort({ createdAt: -1 });

    const jobsWithApplicationsCount = await Promise.all(
      jobs.map(async (job) => {
        const applicants = await JobApplication.find({
          job: job._id,
        })
          .select("applicant status appliedAt")
          .populate("applicant", "surname othername email");
        return { ...job.toObject(), applicants };
      })
    );

    res.json(jobsWithApplicationsCount);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Fetch overall number of jobs
const getJobsCount = async (req, res) => {
  try {
    const jobCount = await Job.countDocument();
    res.status(200).json({
      jobs: jobCount,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update a Job (Only Job Poster)
const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    // Check if logged-in user is the job poster
    if (job.postedBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this job" });
    }

    // Update fields
    const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    res.status(200).json(updatedJob);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete a single job by id
const deleteJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.user.id;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    // Check if the user is an employer who posted the job
    const isJobPoster = job.postedBy.toString() === userId;

    // Check if the user is an admin
    const isAdmin = await Admin.findById(userId);

    // Allow only the employer who posted the job or an admin to delete
    if (isAdmin || isJobPoster) {
      await Job.findByIdAndDelete(jobId);
      await User.findByIdAndUpdate(job.postedBy, {
        $pull: { postedJobs: jobId },
      });

      return res.json({ message: "Job deleted successfully." });
    }

    return res.status(403).json({ error: "Unauthorized to delete this job" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createJob,
  getMyJobs,
  getAllJobs,
  getJob,
  getJobsCount,
  updateJob,
  deleteJob,
};
