const Message = require("../models/messageModel");
const Conversation = require("../models/conversationModel");

// Send a message
exports.sendMessage = async (req, res) => {
  const { conversationId, sender, text } = req.body;

  try {
    const newMessage = await Message.create({
      conversationId,
      sender,
      text,
    });

    // Update last message in conversation
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: newMessage._id,
      updatedAt: Date.now(),
    });

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all messages in a conversation
exports.getMessages = async (req, res) => {
  const { conversationId } = req.params;

  try {
    // Fetch messages
    const messages = await Message.find({ conversationId }).sort("createdAt");

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update the read status of a conversation
exports.updateReadStatus = async (req, res) => {
  const userId = req.user._id;
  const messageId = req.params.id;

  const message = await Message.findById(messageId);

  // if user is the sender, don’t update anything
  if (message.sender.toString() === userId) {
    return res
      .status(200)
      .json({ message: "Sender already sees message as read" });
  }

  // only the receiver can mark a message as read
  if (!message.read) {
    message.read = true;
    await message.save();
  }

  res.status(200).json(message);
};
