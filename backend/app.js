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

 require("./modules/delivery/delivery.model");
require("./modules/vehicle/vehicle.model");
require("./modules/tracking/tracking.model");
require("./modules/report/report.model");
require("./modules/notification/notification.model");


app.use("/vehicle", require("./modules/vehicle/vehicle.routes"));
app.use("/deliveries", require("./modules/delivery/delivery.routes"));
app.use("/tracking", require("./modules/tracking/tracking.routes"));
app.use("/reports", require("./modules/report/report.routes"));
app.use("/notifications", require("./modules/notification/notification.routes"));


// *** KJO PJESË MUNGON TE TI ***
sequelize.sync({ alter: true }) 
  .then(() => console.log("📌 Tables synced successfully"))
  .catch(err => console.error("❌ Sync error:", err));

app.get("/", (req, res) => {
  res.send("Backend is working!");
});

console.log("Loading routers...");
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


// qikat duhet me instalu npm install pdfkit
