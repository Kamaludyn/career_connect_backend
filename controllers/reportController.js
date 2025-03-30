const Report = require("../models/reportModel");

// Submit a report
const submitReport = async (req, res) => {
  try {
    const { reportedJob, reportedResource, category, description } = req.body;

    // The logged-in user reporting the issue
    const reporter = req.user.id; 

    // Ensure required fields are provided
    if (!category || !description) {
      return res.status(400).json({ message: "Category and description are required" });
    }

     // Create a new report instance
    const report = new Report({
      reporter,        // User who submitted the report
      reportedJob,     // ID of the reported job (if applicable)
      reportedResource,// ID of the reported resource (if applicable)
      category,        // Category of the report (e.g., spam, inappropriate content)
      description,     // Details of the issue
    });

    // Save report to the database
    await report.save();

    res.status(201).json({ message: "Report submitted successfully", report });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all reports
const getReports = async (req, res) => {
    try {
      // Fetch all reports
      const reports = await Report.find()
      res.status(200).json(reports);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };
  
// Update and respond to a report
  const updateReportStatus = async (req, res) => {
    try {
      // Report ID from request parameters
      const { id } = req.params;

      // New status from request body
      const { status } = req.body;
  
      // New status from request body
      if (!["pending", "reviewed", "resolved"].includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
      }
  
       // Find and update the report status
      const report = await Report.findByIdAndUpdate(id, { status }, { new: true });
  
      // If the report does not exist, return a 404 error
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }
  
      res.status(200).json({ message: "Report status updated", report });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };
  
  module.exports = {submitReport, getReports, updateReportStatus};
