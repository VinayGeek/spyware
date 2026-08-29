const mongoose = require("mongoose");

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const loginSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: (value) => emailPattern.test(value),
        message: "Please provide a valid email address.",
      },
    },
    password: {
      type: String,
      required: true,
      maxlength: 1024,
    },
  },
  { timestamps: true, versionKey: false, collection: "login" }
);

module.exports = mongoose.model("login", loginSchema);
