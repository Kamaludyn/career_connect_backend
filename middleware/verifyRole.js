const jwt = require("jsonwebtoken");
const Admin = require("../models/adminModel");
const User = require("../models/userModel");

// Verify Admin
const verifyAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Extract token from "Bearer token"
    if (!token) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch admin from DB
    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return res
        .status(403)
        .json({ error: "Unauthorized: Admin access required" });
    }

    // Attach admin info to request
    req.user = admin;

    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

// Verify Employer
const verifyEmployer = async (req, res, next) => {
  try {
    // Find user by id
    const user = await User.findById(req.user.id);

    // If user is not found or the user is not an employer return error
    if (!user || user.role !== "employer") {
      return res
        .status(403)
        .json({ message: "Access denied. Employers only." });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Verify Mentor
const verifyMentor = async (req, res, next) => {
  try {
    // Find user by id
    const user = await User.findById(req.user.id);

    // If user is not found or the user is not a mentor return error
    if (!user || user.role !== "mentor") {
      return res.status(403).json({ message: "Access denied. Mentors only." });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
module.exports = { verifyAdmin, verifyEmployer, verifyMentor };
