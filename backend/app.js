const express = require("express");
const cors = require("cors");
const sequelize = require("./config/db");
require("dotenv").config();
require("./models/index"); // Import modeli + lidhjet

const app = express();
app.use(express.json());
app.use(cors());

// Lidhja me DB
sequelize.authenticate()
  .then(() => console.log("Database connected successfully"))
  .catch(err => console.log("Database connection failed:", err));

// *** KJO PJESË MUNGON TE TI ***
sequelize.sync({ alter: true }) 
  .then(() => console.log("📌 Tables synced successfully"))
  .catch(err => console.error("❌ Sync error:", err));

app.get("/", (req, res) => {
  res.send("Backend is working!");
});

// ROUTES
const productRoutes = require("./modules/produktet/produkt.routes");
app.use("/api/produktet", productRoutes);

const depoRoutes = require("./modules/depo/depo.routes");
app.use("/api/depot", depoRoutes);

const inventoryRoutes = require("./modules/inventari/inventari.routes");
app.use("/api/inventari", inventoryRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
