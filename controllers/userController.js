const User = require("../models/userModel");

// Get All Users
const getUsers = async (req, res) => {
  try {
    // Fetch all users
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get Mentors
const getMentors = async (req, res) => {
  try {
    // Find mentors by their roles
    const mentors = await User.find({ role: "mentor" }).select("-password");

    res.status(200).json(mentors);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get Single User by ID
const getUserById = async (req, res) => {
  try {
    // Find user by id
    const user = await User.findById(req.params.id).select("-password");

    // If user is not found return error
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update User (Self or Admin)
const updateUser = async (req, res) => {
  try {
    // Find user by id
    const user = await User.findById(req.params.id);

    // If user is not found return error
    if (!user) return res.status(404).json({ message: "User not found" });

    // Only allow self-update or admin
    if (
      req.user._id.toString() !== user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Update fields
    user.surname = req.body.surname || user.surname;
    user.othername = req.body.othername || user.othername;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;
    user.department = req.body.department || user.department;
    user.skills = req.body.skills || user.skills;
    user.experience = req.body.experience || user.experience;

    const updatedUser = await user.save();
    res
      .status(200)
      .json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete User (Admin Only)
const deleteUser = async (req, res) => {
  try {
    // Find user by id
    const user = await User.findById(req.params.id);

    // If user is not found return error
    if (!user) return res.status(404).json({ message: "User not found" });

    // Delete the user
    await user.deleteOne();

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getUsers,
  getMentors,
  getUserById,
  updateUser,
  deleteUser,
};
