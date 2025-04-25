const Admin = require("../models/adminModel");
const User = require("../models/userModel");
const Job = require("../models/jobModel");
const Resource = require("../models/resourceModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// Register a New Admin
const registerAdmin = async (req, res) => {
  try {
    const { surname, othername, email, phone, password } = req.body;

    // Check if email or phone is already in use
    const adminExists = await Admin.findOne({ $or: [{ email }, { phone }] });
    if (adminExists)
      return res.status(400).json({ message: "Admin already exists" });

    // Define admin data based on role
    let adminData = {
      surname,
      othername,
      email,
      phone,
      password,
    };

    // Create new admin
    const admin = await Admin.create(adminData);

    // Send response
    res.status(201).json({
      admin,
      token: generateToken(admin._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Login Admin
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find Admin
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ message: "Invalid credentials" });

    // Compare password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    // Send response
    res.json({
      admin,
      token: generateToken(admin._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Logout Admin
const logoutAdmin = (req, res) => {
  res.json({ message: "Logged out successfully" });
};

// Get Logged-in Admin Profile
const getAdminProfile = async (req, res) => {
  try {
    // Find Admin
    const admin = await Admin.findById(req.user.id).select("-password");
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    res.json(admin);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Fetch data statistics
const getDashboardStats = async (req, res) => {
  try {
    // Perform multiple database count operations concurrently using Promise.all
    const [studentCount, mentorCount, employerCount, jobCount, resourceCount] =
      await Promise.all([
        User.countDocuments({ role: "student" }), // Count of users with role "student"
        User.countDocuments({ role: "mentor" }), // Count of users with role "mentor"
        User.countDocuments({ role: "employer" }), // Count of users with role "employer"
        Job.countDocuments(), // Total number of job entries
        Resource.countDocuments(), // Total number of resource entries
      ]);

    // Send back the counts as a JSON response with status 200
    res.status(200).json({
      students: studentCount,
      mentors: mentorCount,
      employers: employerCount,
      jobs: jobCount,
      resources: resourceCount,
    });
  } catch (error) {
    // Handle any unexpected server error
    res.status(500).json({ message: "Server error" });
  }
};

// Delete job as admin
const deleteJobAsAdmin = async (req, res) => {
  try {
    const jobId = req.params.id;

    // Check if the job exists in the database
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ error: "Job not found" });

    // Delete the job from the Job collection
    await Job.findByIdAndDelete(jobId);

    // Remove the job reference from the user who posted it
    await User.findByIdAndUpdate(job.postedBy, {
      $pull: { postedJobs: jobId }, // Pull the jobId from the postedJobs array
    });

    res.json({ message: "Job deleted successfully by admin." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  registerAdmin,
  loginAdmin,
  logoutAdmin,
  getAdminProfile,
  getDashboardStats,
  deleteJobAsAdmin,
};
