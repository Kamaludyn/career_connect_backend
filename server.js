const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require("compression");
const connectDb = require("./config/dbConnection");

// Load environment variables from .env file
require("dotenv").config();

// Import route handlers
const adminRoutes = require("./routes/adminRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const jobRoutes = require("./routes/jobRoutes");
const mentorshipRoutes = require("./routes/mentorshipRoutes");
const jobApplicationRoutes = require("./routes/jobApplicationRoutes");
const resourceRoutes = require("./routes/resourceRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const reportRoutes = require("./routes/reportRoutes");
const conversationRoutes = require("./routes/conversationRoutes");
const messageRoutes = require("./routes/messageRoutes");

// Initialize Express app
const app = express();

const server = http.createServer(app);

const allowedOrigin = process.env.CLIENT_URL;

let userSocketMap = {};

// Allow socket.io through CORS
const io = new Server(server, {
  cors: {
    origin: allowedOrigin,
    methods: ["GET", "POST"],
  },
});

// Establish connection to the database
(async () => {
  try {
    await connectDb();
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1); // Exit process with failure
  }
})();

// Security Middleware
app.use(helmet()); // Secure HTTP headers
app.use(compression()); // Compress responses to improve performance
app.use(
  cors({
    origin: allowedOrigin,
  })
); // Enable CORS for frontend

// Middleware
app.use(express.json()); // Parse JSON request bodies

// Logging Middleware (Only in Development)
if (process.env.NODE_ENV === "production") {
  app.use(morgan("combined")); // More detailed logs in production
} else {
  app.use(morgan("dev"));
}

// API Routes
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/mentorships", mentorshipRoutes);
app.use("/api/applications", jobApplicationRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);

// Handle undefined routes
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(
    "Error:",
    process.env.NODE_ENV === "production" ? err.message : err.stack
  );
  res.status(500).json({ message: "Internal Server Error" });
});

// SOCKET.IO EVENTS
io.on("connection", (socket) => {
  // Register the user's socket id
  socket.on("register", (userId) => {
    userSocketMap[userId] = socket.id;
  });

  // Join a specific room (conversation)
  socket.on("join_room", (conversationId) => {
    socket.join(conversationId);
  });

  // Send message only to users in that conversation (room)
  socket.on("send_message", (data) => {
    const { conversationId, isNewConversation, receiver } = data;

    // Emit message to users already in the room (except sender)
    socket.to(conversationId).emit("receive_message", data);

    // If this is a new conversation, send a direct event to the receiver.
    if (isNewConversation && receiver) {
      const receiverSocketId = userSocketMap[receiver];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("new_conversation_message", data);
      }
    }
  });

  socket.on("disconnect", () => {
    // remove the socket mapping
    for (const [userId, sId] of Object.entries(userSocketMap)) {
      if (sId === socket.id) {
        delete userSocketMap[userId];
        break;
      }
    }
  });
});

// Start the server
const PORT = process.env.PORT;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
