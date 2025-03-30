const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// Register a New User
const registerUser = async (req, res) => {
  try {
    const {
      surname,
      othername,
      email,
      phone,
      password,
      role,
      department, // For student and mentors
      level, // For students
      skills, // For students
      yearsOfExperience, // Optional for students
      yearOfGraduation, // For mentors
      jobTitle, // For  mentors
      industry, // For mentors and employers
      companyName, // For mentor and employers
      website, // For employers
    } = req.body;

    // Check if email or phone is already in use
    const userExists = await User.findOne({ $or: [{ email }, { phone }] });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    // Validate role
    const allowedRoles = ["student", "mentor", "employer"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role specified" });
    }

    // Define user data based on role
    let userData = {
      surname,
      othername,
      email,
      phone,
      password,
      role,
      department,
    };

    if (role === "student") {
      userData.department = department;
      userData.level = level;
      userData.skills = skills || [];
      userData.yearsOfExperience = yearsOfExperience || 0;
    }

    if (role === "mentor") {
      userData.department = department;
      userData.yearOfGraduation = yearOfGraduation;
      userData.jobTitle = jobTitle;
      userData.industry = industry;
      userData.companyName = companyName;
    }

    if (role === "employer") {
      userData.companyName = companyName;
      userData.industry = industry;
      userData.website = website || "";
    }

    // Create new user
    const user = await User.create(userData);

    // Send response
    res.status(201).json({
      _id: user._id,
      surname: user.surname,
      othername: user.othername,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Incorrect Email" });

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Incorrect Password" });

    // Send response
    res.json({
      user,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get Logged-in User Profile
const getUserProfile = async (req, res) => {
  try {
    // Find user excluding password
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update User Profile
const updateProfile = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: req.body }, // Only update provided fields
      { new: true } // Return the updated document
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Logout User
const logoutUser = (req, res) => {
  res.json({ message: "Log out successful" });
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateProfile,
  logoutUser,
};
