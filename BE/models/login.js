const mongoose = require("mongoose");

const loginSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      default: "",
    },
    password: {
      type: String,
      default: "",
    },
  },
  { timestamps: true, versionKey: false },
);

module.exports = mongoose.model("login", loginSchema);
