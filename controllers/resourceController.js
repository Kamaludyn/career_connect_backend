const Resource = require("../models/resourceModel");

// Upload a new resource
const uploadResource = async (req, res) => {
  try {
    const { title, description, body, price, category } = req.body;

    if (!title || !description || !body || !category) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newResource = new Resource({
      title,
      description,
      body,
      price,
      category,
      uploadedBy: req.user.id,
    });

    await newResource.save();
    res.status(201).json({
      message: "Resource uploaded successfully",
      resource: newResource,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all resources
const getAllResources = async (req, res) => {
  try {
    const resources = await Resource.find().populate(
      "uploadedBy",
      "surname othername email"
    );
    res.status(200).json(resources);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get a single resource
const getSingleResource = async (req, res) => {
  try {
    // Find resource by id
    const resource = await Resource.findById(req.params.id).populate(
      "uploadedBy",
      "surname othername email"
    );

    // If the resource does not exist, return a 404 error
    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    // Increment access count
    resource.accessCount += 1;
    await resource.save();

    res.status(200).json(resource);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get resources uploaded by the logged-in user (Mentor's resources)
const getMyResources = async (req, res) => {
  try {
    const resources = await Resource.find({ uploadedBy: req.user.id });
    res.status(200).json(resources);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete a resource
const deleteResource = async (req, res) => {
  try {
    // Find resource by Id
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    // Check if the user is the uploader or an admin
    if (
      resource.uploadedBy.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Unauthorized action" });
    }

    // Delete the resource
    await resource.deleteOne();

    res.status(200).json({ message: "Resource deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  uploadResource,
  getAllResources,
  getSingleResource,
  getMyResources,
  deleteResource,
};
