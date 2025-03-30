const express = require("express");
const { verifyMentor } = require("../middleware/verifyRole");
const verifyToken = require("../middleware/verifyToken");
const {
  uploadResource,
  getAllResources,
  getMyResources,
  getSingleResource,
  deleteResource,
} = require("../controllers/resourceController");
const router = express.Router();

// @desc    Upload a new Resource
// @route   POST /api/resources
// @access  Private (Mentors only)
router.post("/", verifyToken, verifyMentor, uploadResource);
// router.post("/", verifyToken, uploadResource);

// @desc    Get all Resources
// @route   GET /api/resources/
// @access  Public
router.get("/", getAllResources);

// @desc    Get all Resources posted by a specific Mentor
// @route   GET /api/resources/my-resources
// @access  Private (Mentors only)
router.get("/my-resources", verifyToken, verifyMentor, getMyResources);

// @desc    Get a single Resource
// @route   GET /api/resources/:id
// @access  Public
router.get("/:id", getSingleResource);

// @desc    Delete a Resource
// @route   DELETE /api/resources/:id
// @access  Privavte (Mentors & Admins)
router.delete("/:id", deleteResource);


module.exports = router;
