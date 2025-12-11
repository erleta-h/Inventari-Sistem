const express = require("express");
const TrackingController = require("./tracking.controller.js");
const { validateTracking } = require("./tracking.validation.js");

const router = express.Router();
const controller = new TrackingController();

// Save new tracking point
router.post("/:id/location", validateTracking, controller.saveLocation);

// Get all tracking points for a delivery
router.get("/:id", controller.getTracking);

// Get latest tracking point for a delivery
router.get("/:id/latest", controller.getLatest);

module.exports = router;
