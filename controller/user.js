const UserDB = require("../models/user");
const { successResponse } = require("../utils/response");
const path = require("path");
const cloudinary = require("../utils/cloudinary");

exports.createUser = async (req, res) => {
  try {
    const { ip, city, region, country, loc, org, postal, timezone, isFetched } =
      req.body;

    const userData = await UserDB.create({
      ip,
      city,
      region,
      country,
      latitude: loc.split(",")[0],
      longitude: loc.split(",")[1],
      org,
      postal,
      timezone,
      isFetched,
    });

    if (!userData) {
      successResponse(res, 500, "User not created", {});
    }

    successResponse(res, 200, "User created successfully", userData);
  } catch (error) {
    successResponse(res, 500, error.message, {});
  }
};

exports.createMoment = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No file provided"
    });
  }

  try {
    console.log("File path:", req.file.path); 
    cloudinary.uploader.upload(req.file.path, function (err, result) {
      if (err) {
        console.log("Cloudinary Error:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to upload image to Cloudinary",
          error: err.message 
        });
      }

      res.status(201).json({
        success: true,
        message: "Moment added successfully!",
        data: result
      });
    });
  } catch (error) {
    console.error("Server Error:", error); 
    res.status(500).json({
      success: false,
      message: "Server error occurred",
      error: error.message 
    });
  }
};


exports.getAllImages = async (req, res) => {
  try {

    let maxResults = 1000;

    if (req.body.max_results) {
      if (isNaN(req.body.max_results)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid max_results parameter, it must be a number'
        });
      }

      maxResults = parseInt(req.body.max_results, 10);
      if (maxResults <= 0 || maxResults > 1000) { 
        return res.status(400).json({
          success: false,
          message: 'max_results must be a positive number and no more than 1000'
        });
      }
    }

    let result = await cloudinary.search
      .expression('resource_type:image')
      .sort_by('public_id', 'desc')
      .max_results(maxResults) 
      .execute();

    if (result.resources.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No images found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Images retrieved successfully',
      data: result.resources
    });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred",
      error: error.message
    });
  }
};


exports.deleteImages = async (req, res) => {
  if (!req.body || !Array.isArray(req.body) || req.body.some(item => !item.public_id)) {
    return res.status(400).json({
      success: false,
      message: 'Request body must be an array of objects with a "public_id" property'
    });
  }

  const public_ids = req.body.map(item => item.public_id);
  const results = [];

  for (let public_id of public_ids) {
    try {
      let result = await cloudinary.uploader.destroy(public_id);
      results.push({
        public_id: public_id,
        result: result.result === "ok" ? "deleted" : result.result
      });
    } catch (error) {
      results.push({
        public_id: public_id,
        result: "error",
        error: error.message
      });
    }
  }

  const deletedCount = results.filter(result => result.result === "deleted").length;

  if (deletedCount === public_ids.length) {
    res.status(200).json({
      success: true,
      message: 'All images deleted successfully',
      results: results
    });
  } else if (deletedCount > 0) {
    res.status(207).json({
      success: true,
      message: 'Some images were not deleted successfully',
      results: results
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'No images were deleted',
      results: results
    });
  }
};

