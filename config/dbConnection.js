const mongoose = require("mongoose");

// Establishes a connection to MongoDB
const connectDb = async () => {
  try {
    // Connect to MongoDB
    const connect = await mongoose.connect(process.env.CONNECTION_STRING);
    console.log(
      "MongoDB connected successfully:",
      connect.connection.name
    );
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};

module.exports = connectDb;
