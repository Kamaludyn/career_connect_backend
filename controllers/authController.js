const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "2d" });
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

// Change Password
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);

    // Compare the provided current password with the stored hashed password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect current password" });
    }

    // Update the user's password with the new password
    user.password = newPassword;
    await user.save(); // Save the updated user document

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Forgot Password
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ message: "A User with this email was not found" });

    // Generate a random token for password reset
    const token = crypto.randomBytes(32).toString("hex");

    // Save the reset token to the user's record
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // Set token expiration (5 minutes)

    // Save the updated user document
    await user.save();

    // Construct the password reset URL
    const resetURL = `${process.env.CLIENT_URL}/reset-password/${token}`;

    // Create the email message
    const message = `You requested a password reset.\nClick the following link to reset your password: ${resetURL}.\n Note: The reset link expires after 10 minutes `;

    // Send the password reset email
    await sendEmail({
      to: user.email,
      subject: "Password Reset",
      text: message,
    });

    // Respond with a success message
    res.status(200).json({
      message: `A password reset link is has been sent to ${email} and will expire in 10 minutes!`,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  const { token } = req.params; // Extract the reset token from the request parameters
  const { password } = req.body; // Extract the new password from the request body

  try {
    // Find the user by the reset token and ensure the token has not expired
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // Ensure the token is still valid
    });

    if (!user)
      // If no user is found or the token is expired, return an error response
      return res.status(400).json({ message: "Invalid or expired token" });

    // Update the user's password and clear the reset token and expiration
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    // Save the updated user document
    await user.save();

    // Respond with a success message
    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateProfile,
  logoutUser,
  changePassword,
  forgotPassword,
  resetPassword,
};
