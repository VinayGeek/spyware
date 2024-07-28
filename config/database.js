const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose
    .connect(`${process.env.DB}`)
    .then((data) => console.log(`mongoDB connected ✅`))
    .catch((err) => console.log("DB Connection ERROR ::", err.message));
};

module.exports = connectDB;
