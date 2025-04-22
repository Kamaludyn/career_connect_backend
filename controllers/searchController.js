const User = require("../models/userModel");
const Job = require("../models/jobModel");
const Resource = require("../models/resourceModel");

const searchController = async (req, res) => {
  // Extract the search query (q) from the request's query parameters
  const { q } = req.query;

  // If no query is provided, return a 400 Bad Request response
  if (!q) return res.status(400).json({ message: "Search query is required" });

  // Extract pagination parameters (page & limit), defaulting to 1 and 10 if not provided
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  // Create a case-insensitive regex for searching
  const searchRegex = new RegExp(q, "i");

  // Calculate the number of items to skip based on current page
  const skip = (page - 1) * limit;

  try {
    // Perform parallel search queries for mentors, jobs, and resources
    const [mentors, jobs, resources] = await Promise.all([
      // Search mentors (users with role 'mentor') by surname or othername
      User.find({
        role: "mentor",
        $or: [{ surname: searchRegex }, { othername: searchRegex }],
      }) // Return only selected fields for each mentor
        .select("surname othername jobTitle companyName industry _id")
        .skip(skip)
        .limit(limit),

      // Search jobs by title, company, type, or location
      Job.find({
        $or: [
          { title: searchRegex },
          { company: searchRegex },
          { type: searchRegex },
          { location: searchRegex },
        ],
      }) // Return only selected fields for each job
        .select(
          "title company type location locationDetails currency minSalary _id"
        )
        .skip(skip)
        .limit(limit),

      // Search resources by title
      Resource.find({
        title: searchRegex,
      }) // Return only the title and ID of each resource
        .select("title _id")
        .skip(skip)
        .limit(limit),
    ]);

    // Send the search results as a JSON response
    res.status(200).json({
      mentors,
      jobs,
      resources,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Search failed" });
  }
};

module.exports = searchController;
