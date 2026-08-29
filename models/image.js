const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema(
  {
    data: {
      type: Buffer,
      required: true,
    },
    contentType: {
      type: String,
      required: true,
      enum: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("image", imageSchema);
