const express = require("express");
const VehicleController = require("./vehicle.controller.js");
const { validateVehicle, validateVehicleStatus } = require("./vehicle.validation.js");

const router = express.Router();
const controller = new VehicleController();

// Create vehicle
router.post("/", validateVehicle, controller.create);

// Get all vehicles
router.get("/", controller.getAll);

// Get one vehicle
router.get("/:id", controller.getById);

// Update full vehicle
router.put("/:id", validateVehicle, controller.update);

// Delete vehicle
router.delete("/:id", controller.delete);

// Update vehicle status only
router.patch("/:id/status", validateVehicleStatus, controller.setStatus);

console.log("Vehicle router loaded!");


module.exports = router;
