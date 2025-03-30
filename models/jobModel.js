const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    description: { type: String, required: true },
    location: {
      type: String,
      enum: ["On-Campus", "Off-Campus", "Remote"],
      required: true,
    },
    locationDetails: { type: String },
    type: {
      type: String,
      enum: ["Full-time", "Part-time", "Contract", "Internship"],
      required: true,
    },
    experienceLevel: {
      type: String,
      enum: ["Entry", "Intermediate", "Mid-level", "Senior"],
      required: true,
    },
    minSalary: { type: Number },
    maxSalary: { type: Number },
    currency: {
      type: String,
      enum: ["NGN", "USD", "EUR", "GBP"],
      default: "NGN",
    },
    applicationMethod: {
      type: String,
      enum: ["careerconnect", "external", "email"],
      required: true,
    },
    applicationLink: { type: String },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", jobSchema);
