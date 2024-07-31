const express = require("express");
const path = require("path");
const cors = require("cors");
const fs = require("fs");
const userRoutes = require("./routes/user");

const app = express();

app.use(express.json());
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
  res.status(err.status || 500);
  res.json({
    error: {
      message: err.message || "An unexpected error occurred",
      status: err.status || 500,
    },
  });
});

module.exports = app;
