const express = require("express");
const formData = require("express-form-data");
const cors = require("cors");
const app = express();

const userRoutes = require("./routes/user");

app.use(express.json({ limit: "10mb" }));
app.use(formData.parse({ autoClean: true }));
app.use(cors());

app.use("/user", userRoutes);

module.exports = app;
