const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "image" + Date.now(),
    },
    buffer: {
      type: Buffer,
      default: "",
    },
  },
  { timestamps: true, versionKey: false },
);

module.exports = mongoose.model("image", imageSchema);
