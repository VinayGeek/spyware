const app = require("./app");
const connectDB = require("./config/database");

connectDB();

app.get("/", (req, res) => {
  res.send("server is running");
});

app.listen(process.env.PORT, () => {
  console.clear();
  console.log(`http://localhost:${process.env.PORT} ✅`);
});
