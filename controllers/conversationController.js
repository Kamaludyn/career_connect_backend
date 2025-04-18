const mongoose = require("mongoose");
const Conversation = require("../models/conversationModel");
const Message = require("../models/messageModel");
const User = require("../models/userModel");

// Create or fetch a conversation between two users
exports.createOrGetConversation = async (req, res) => {
  const senderId = req.user.id; // Get from authenticated user
  const { receiverId } = req.body;

  try {
    // Check if receiverId is a valid Mongo ObjectId
    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({ message: "Invalid receiver ID" });
    }

    // Check if the receiver user actually exists
    const receiver = await User.findById(receiverId);

    // Check if the receiver exist
    if (!receiver) {
      res.status(404).json({ message: "Receiver not found" });
    }

    // Check for exist conversation between the logged-in user and the receiver
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    }).populate("lastMessage");

    // Create a new conversation if it doesn't exist
    if (!conversation) {
      console.log("Creating new conversation");
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });

      // Populate the conversation the participant info and last message
      conversation = await Conversation.findById(conversation.id)
        .populate("participants", "othername surname role")
        .populate("lastMessage");
    }

    res.status(200).json(conversation);
  } catch (error) {
    console.error("Error creating/getting conversation:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get all conversations for a user
exports.getUserConversations = async (req, res) => {
  const userId = req.params.userId;

  try {
    // Find all conversation thats involves the logged-in user
    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate("participants", "othername surname role")
      .populate("lastMessage")
      .sort({ updatedAt: -1 });

    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
