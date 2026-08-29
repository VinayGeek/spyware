const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    ip: {
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
  },
  { timestamps: true, versionKey: false },
);

module.exports = mongoose.model("user", userSchema);
