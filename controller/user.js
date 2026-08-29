const UserDB = require("../models/user");
const ImageDB = require("../models/image");
const { successResponse } = require("../utils/response");
const cloudinary = require("../utils/cloudinary");
const {
  toImageBuffer,
  getImageContentType,
  saveImageToUploads,
} = require("../utils/image");

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

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
  const imageBuffer = toImageBuffer(req.file?.buffer);

  if (!imageBuffer || imageBuffer.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'An image file is required in the multipart field named "image".',
    });
  }

  if (imageBuffer.length > MAX_IMAGE_SIZE_BYTES) {
    return res.status(413).json({
      success: false,
      message: "Image must not exceed 5 MB.",
    });
  }

  const contentType = getImageContentType(imageBuffer);
  if (!contentType) {
    return res.status(400).json({
      success: false,
      message: "Only JPEG, PNG, GIF, and WebP image buffers are allowed.",
    });
  }

  try {
    const image = await ImageDB.create({
      data: imageBuffer,
      contentType,
    });

    res.status(201).json({
      success: true,
      message: "Image stored successfully.",
      data: {
        id: image._id,
        contentType,
        size: imageBuffer.length,
        createdAt: image.createdAt,
      },
    });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred",
      error: error.message,
    });
  }
};

exports.getAllImages = async (req, res) => {
  try {
    let maxResults = 1000;
    const requestedMaxResults = req.query.max_results;

    if (requestedMaxResults !== undefined) {
      if (!/^\d+$/.test(requestedMaxResults)) {
        return res.status(400).json({
          success: false,
          message: "Invalid max_results parameter, it must be a number",
        });
      }

      maxResults = Number.parseInt(requestedMaxResults, 10);
      if (maxResults <= 0 || maxResults > 1000) {
        return res.status(400).json({
          success: false,
          message:
            "max_results must be a positive number and no more than 1000",
        });
      }
    }

    const storedImages = await ImageDB.find()
      .sort({ createdAt: -1 })
      .limit(maxResults)
      .select("data contentType createdAt");

    if (storedImages.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No images found",
      });
    }

    // Testing only: uncomment this to export every database image to /uploads.
    // await Promise.all(
    //   storedImages.map((image) =>
    //     saveImageToUploads(image.data, image._id.toString())
    //   )
    // );

    const images = storedImages.map((image) => ({
      id: image._id,
      image: {
        type: "Buffer",
        data: image.data.toString("base64"),
      },
      contentType: image.contentType,
      createdAt: image.createdAt,
    }));

    res.status(200).json({
      success: true,
      data: images,
    });
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred",
      error: error.message,
    });
  }
};

exports.deleteImages = async (req, res) => {
  if (
    !req.body ||
    !Array.isArray(req.body) ||
    req.body.some((item) => !item.public_id)
  ) {
    return res.status(400).json({
      success: false,
      message:
        'Request body must be an array of objects with a "public_id" property',
    });
  }

  const public_ids = req.body.map((item) => item.public_id);
  const results = [];

  for (let public_id of public_ids) {
    try {
      let result = await cloudinary.uploader.destroy(public_id);
      results.push({
        public_id: public_id,
        result: result.result === "ok" ? "deleted" : result.result,
      });
    } catch (error) {
      results.push({
        public_id: public_id,
        result: "error",
        error: error.message,
      });
    }
  }

  const deletedCount = results.filter(
    (result) => result.result === "deleted"
  ).length;

  if (deletedCount === public_ids.length) {
    res.status(200).json({
      success: true,
      message: "All images deleted successfully",
      results: results,
    });
  } else if (deletedCount > 0) {
    res.status(207).json({
      success: true,
      message: "Some images were not deleted successfully",
      results: results,
    });
  } else {
    res.status(404).json({
      success: false,
      message: "No images were deleted",
      results: results,
    });
  }
};
