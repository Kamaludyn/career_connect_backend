const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Resource title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    body: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      enum: [
        "Interview Preparation",
        "Resume & Cover Letter Writing",
        "Career Growth Strategies",
        "Networking & Personal Branding",
        "Internship & Job Search Tips",
        "Time Management & Productivity",
        "Public Speaking & Communication Skills",
        "Freelancing & Side Hustles",
        "Leadership & Teamwork",
        "Technical Skills & Certifications",
        "Soft Skills Development",
        "Entrepreneurship & Startups",
        "Work-Life Balance & Mental Well-being",
        "Industry Insights & Trends",
        "Scholarships & Study Abroad Tips",
        "Others",
      ],
      required: [true, "Category is required"],
    },
    accessCount: {
      type: Number,
      default: 0,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resource", resourceSchema);
