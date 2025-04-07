const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    surname: {
      type: String,
      required: [true, "Surname is required"],
      trim: true,
    },
    othername: {
      type: String,
      required: [true, "Other name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    bio: { type: String, default: "" },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["student", "mentor", "employer"],
      required: true,
    },
    education: [
      {
        school: String,
        degree: String,
        year: String,
      }, // For mentors and students
    ],
    certifications: [
      {
        name: String,
        year: String,
      }, // For mentors and students
    ],
    department: {
      type: String,
      trim: true,
    },
    level: {
      type: String,
      trim: true,
      default: null, // For students only
    },
    skills: {
      type: [String],
      default: [], // Optional for students
    },
    yearsOfExperience: {
      type: Number,
      default: 0, // Optional for students
    },
    yearOfGraduation: {
      type: Number,
      default: null, // For mentors only
    },
    jobTitle: {
      type: String,
      trim: true,
      default: null, // For mentors only
    },
    availability: {
      type: Boolean,
      default: true, // For mentors only
    },
    industry: {
      type: String,
      trim: true,
      default: null, // For mentors and employers
    },
    companyName: {
      type: String,
      trim: true,
      default: null, // For mentors and employers
    },
    website: {
      type: String,
      trim: true,
      default: null, // Optional for employers
    },
    postedJobs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job", // Reference to the Job model (For employers)
      },
    ],
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
