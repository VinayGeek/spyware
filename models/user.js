const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    ip: {
      type: String,
      default: "",
    },
    city: {
      type: String,
      default: "",
    },
    region: {
      type: String,
      default: "",
    },
    country: {
      type: String,
      default: "",
    },
    longitude: {
      type: String,
      default: "",
    },
    latitude: {
      type: String,
      default: "",
    },
    org: {
      type: String,
      default: "",
    },
    postal: {
      type: String,
      default: "",
    },
    timezone: {
      type: String,
      default: "",
    },
    isFetched: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("user", userSchema);
