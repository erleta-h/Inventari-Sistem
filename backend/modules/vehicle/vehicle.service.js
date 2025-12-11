const Vehicle = require("./vehicle.model.js");
const NotificationService = require("../notification/notification.service.js");

class VehicleService {
  constructor() {
    this.notificationService = new NotificationService();
  }

  // Create a new vehicle
  async create(data) {
    const vehicle = await Vehicle.create({
      plateNumber: data.plateNumber,
      type: data.type,
      capacity: data.capacity,
      status: "Available",
      fuelLevel: data.fuelLevel || null,
      lastMaintenance: data.lastMaintenance || null,
      isActive: true
    });

    // Notify system about new vehicle
    this.notificationService.notifyVehicleEvent(
      vehicle.id,
      "A new vehicle has been added to the fleet."
    );

    return vehicle;
  }

  // Get all vehicles
  async getAll() {
    return await Vehicle.findAll();
  }

  // Get vehicle by ID
  async getById(id) {
    const vehicle = await Vehicle.findByPk(id);
    if (!vehicle) throw new Error("Vehicle not found");
    return vehicle;
  }

  // Update vehicle information
  async update(id, data) {
    const vehicle = await Vehicle.findByPk(id);
    if (!vehicle) throw new Error("Vehicle not found");

    await vehicle.update({
      plateNumber: data.plateNumber,
      type: data.type,
      capacity: data.capacity,
      status: data.status,
      fuelLevel: data.fuelLevel,
      lastMaintenance: data.lastMaintenance,
      isActive: data.isActive
    });

    this.notificationService.notifyVehicleEvent(
      id,
      "Vehicle information has been updated."
    );

    return vehicle;
  }

  // Delete or deactivate vehicle
  async delete(id) {
    const vehicle = await Vehicle.findByPk(id);
    if (!vehicle) throw new Error("Vehicle not found");

    await vehicle.update({ isActive: false });

    this.notificationService.notifyVehicleEvent(
      id,
      "Vehicle has been deactivated."
    );

    return { message: "Vehicle deactivated" };
  }

  // Update only vehicle status (Available, InUse, Maintenance)
  async setStatus(id, status) {
    const vehicle = await Vehicle.findByPk(id);
    if (!vehicle) throw new Error("Vehicle not found");

    await vehicle.update({ status });

    // Status-based notifications
    if (status === "Maintenance") {
      this.notificationService.notifyVehicleEvent(
        id,
        "Vehicle moved to MAINTENANCE state."
      );
    }

    if (status === "Available") {
      this.notificationService.notifyVehicleEvent(
        id,
        "Vehicle is now AVAILABLE for deliveries."
      );
    }

    if (status === "InUse") {
      this.notificationService.notifyVehicleEvent(
        id,
        "Vehicle is currently in use."
      );
    }

    return vehicle;
  }

  // Check if vehicle is available
  async isAvailable(id) {
    const vehicle = await Vehicle.findByPk(id);
    if (!vehicle) throw new Error("Vehicle not found");

    return vehicle.status === "Available";
  }
}

module.exports = VehicleService;
