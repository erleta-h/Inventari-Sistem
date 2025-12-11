const Delivery = require("./delivery.model.js");
const NotificationService = require("../notification/notification.service.js");
const Tracking = require("../tracking/tracking.model.js");
const Vehicle = require("../vehicle/vehicle.model.js");
//const User = require("../user/user.model.js");

class DeliveryService {
  constructor() {
    this.notificationService = new NotificationService();
  }

  async create(data) {
    const delivery = await Delivery.create({
      orderId: data.orderId,
     // driverId: data.driverId || null,
      vehicleId: data.vehicleId || null,
      status: "PENDING",
      currentLocation: null,
      expectedDeliveryTime: data.expectedDeliveryTime || null,
      notes: data.notes || null,
    });

    // System notification
    this.notificationService.sendSystemNotification(
      `A new delivery has been created (Order ID: ${data.orderId}).`
    );

    return delivery;
  }

  async assignDriver(deliveryId, driverId, vehicleId) {
    const delivery = await Delivery.findByPk(deliveryId);

    if (!delivery) throw new Error("Delivery not found");

    await delivery.update({
     // driverId,
      vehicleId,
      status: "ASSIGNED",
    });

    /*
    // Notify driver
    this.notificationService.notifyUser(
      driverId,
      `You have been assigned to delivery #${deliveryId}`
    );*/

    // Notify system
    this.notificationService.notifyDeliveryEvent(
      deliveryId,
      `Driver ${driverId} assigned.`
    );

    return delivery;
  }

  async updateStatus(id, status) {
    const delivery = await Delivery.findByPk(id);

    if (!delivery) throw new Error("Delivery not found");

    await delivery.update({ status });

    this.notificationService.notifyDeliveryEvent(
      id,
      `Status updated to: ${status}`
    );

    return delivery;
  }

  async markAsFailed(id, reason) {
    const delivery = await Delivery.findByPk(id);

    if (!delivery) throw new Error("Delivery not found");

    await delivery.update({
      status: "FAILED",
      notes: reason,
    });

    this.notificationService.notifyDeliveryEvent(
      id,
      `Delivery FAILED. Reason: ${reason}`
    );

    return delivery;
  }

  async saveLocation(deliveryId, lat, lng, speed = null, address = null) {
    const delivery = await Delivery.findByPk(deliveryId);

    if (!delivery) throw new Error("Delivery not found");

    // Add tracking record
    await Tracking.create({
      deliveryId,
      latitude: lat,
      longitude: lng,
      speed,
      address,
    });

    // Update Delivery table
    await delivery.update({
      currentLocation: `${lat},${lng}`
    });

    this.notificationService.notifyDeliveryEvent(
      deliveryId,
      `Location updated: (${lat}, ${lng})`
    );

    return { message: "Location saved" };
  }

  async getTracking(deliveryId) {
    return await Tracking.findAll({
      where: { deliveryId },
      order: [["timestamp", "DESC"]],
    });
  }

  async getById(id) {
    const delivery = await Delivery.findByPk(id);

    if (!delivery) throw new Error("Delivery not found");

    return delivery;
  }

  async getAll() {
    return await Delivery.findAll({
      include: [
        { model: Vehicle, as: "vehicle" },
       // { model: User, as: "driver" },
      ]
    });
  }
}

module.exports = DeliveryService;
