const UserDB = require("../models/user");
const { successResponse } = require("../utils/response");

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
