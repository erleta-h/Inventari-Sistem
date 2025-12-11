const express = require("express");
const DeliveryController = require("./delivery.controller.js");
const { validateDelivery } = require("./delivery.validation.js");
const { validateTracking } = require("../tracking/tracking.validation.js");

const router = express.Router();
const controller = new DeliveryController();

// Create a new delivery
router.post("/", validateDelivery, controller.create);

// Assign a driver to a delivery
//router.post("/:id/assign", controller.assignDriver);

// Update delivery status
router.patch("/:id/status", controller.updateStatus);

// Mark delivery as failed
router.patch("/:id/failed", controller.markAsFailed);

// Save new location / tracking point
router.post("/:id/location", validateTracking, controller.saveLocation);

// Get tracking history for a delivery
router.get("/:id/tracking", controller.getTracking);

// Get all deliveries
router.get("/", controller.getAll);

// Get single delivery by ID
router.get("/:id", controller.getById);

module.exports = router;
