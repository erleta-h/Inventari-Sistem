const express = require("express");
const ReportController = require("./report.controller.js");
const { validateReport } = require("./report.validation.js");

const router = express.Router();
const controller = new ReportController();

// Generate reports
router.post("/deliveries", validateReport, controller.generateDeliveryReport);
router.post("/vehicles", validateReport, controller.generateVehicleReport);
router.post("/tracking/:deliveryId", validateReport, controller.generateTrackingReport);

// Get all reports
router.get("/", controller.getAll);

// Get report by ID
router.get("/:id", controller.getById);

// Download PDF version of a report
router.get("/:id/pdf", controller.downloadPDF);

module.exports = router;
