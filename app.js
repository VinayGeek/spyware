const express = require("express");
const path = require("path");
const cors = require("cors");
const fs = require("fs");
const userRoutes = require("./routes/user");

const app = express();

// Base64 and JSON Buffer payloads are larger than the original image bytes.
app.use(express.json({ limit: "10mb" }));
app.use(cors());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/images", (req, res) => {
  fs.readdir(path.join(__dirname, "uploads"), (err, files) => {
    const images = files
      .filter((file) => /\.(jpg|jpeg|png|gif)$/i.test(file))
      .map((file) => `${req.protocol}://${req.get("host")}/uploads/${file}`);
    res.json(images);
  });
});

app.use("/user", userRoutes);

app.use((err, req, res, next) => {
  console.error(`[Error] ${err.name} - ${err.message} - ${err.status || 500}`);
  if (res.headersSent) return next(err);
  const status = err.code === "LIMIT_FILE_SIZE" ? 413 : err.status || 500;
  res.status(status);
  res.json({
    error: {
      message:
        err.code === "LIMIT_FILE_SIZE"
          ? "Image must not exceed 5 MB."
          : err.message || "An unexpected error occurred",
      status,
    },
  });
});

module.exports = app;
