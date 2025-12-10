const express = require("express");
const cors = require("cors");
const sequelize = require("./config/db");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

require("./modules/orders/AssociationsOrder");


sequelize.sync({ alter: true }) 
  .then(() => console.log("📌 Tables synced successfully"))
  .catch(err => console.error("❌ Sync error:", err));

app.get("/", (req, res) => {
  res.send("Backend is working!");
});

sequelize.authenticate()
  .then(() => console.log("Database connected successfully"))
  .catch(err => console.log("Database connection failed:", err));

app.get("/", (req, res) => {
  res.send("Backend is working!");
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
