const express = require("express");
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

// Initialize Express app
const app = express();

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
app.use(cors()); // Enable CORS for frontend

// Middleware
app.use(express.json()); // Parse JSON request bodies

// Logging Middleware (Only in Development)
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined")); // More detailed logs in production
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

// Handle undefined routes
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("Error:", process.env.NODE_ENV === "development" ? err.stack : err.message);
  res.status(500).json({ message: "Internal Server Error" });
});

// Start the server
const PORT = process.env.PORT || 8880;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} on port ${PORT}`);
});
