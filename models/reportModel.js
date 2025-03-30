const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Who is reporting
    reportedJob: { type: mongoose.Schema.Types.ObjectId, ref: "Job" }, // Job being reported (if applicable)
    reportedResource: { type: mongoose.Schema.Types.ObjectId, ref: "Resource" }, // Resource being reported (if applicable)
    category: { type: String, required: true, enum: ["User Misconduct", "Inappropriate Content", "Technical Issue", "Others"] },
    description: { type: String, required: true },
    status: { type: String, enum: ["pending", "reviewed", "resolved"], default: "pending" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);
