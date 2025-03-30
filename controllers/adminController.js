const Admin = require("../models/adminModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
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
    const admin = await Admin.findById(req.admin.id).select("-password");
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    res.json(admin);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { registerAdmin, loginAdmin, logoutAdmin, getAdminProfile };
