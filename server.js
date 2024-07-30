const app = require("./app");
const env = require("dotenv");
const connectDB = require("./config/database");

env.config({ path: "./.env" });

connectDB();

app.get("/", (req, res) => {
  res.send("server is running");
});

app.listen(process.env.PORT, () => {
  console.clear();
  console.log(`http://localhost:${process.env.PORT} ✅`);
});
