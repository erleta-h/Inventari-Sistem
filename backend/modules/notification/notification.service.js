const Notification = require("./notification.model.js");

class NotificationService {

  async sendSystemNotification(message) {
    return await Notification.create({
      type: "System",
      message,
      recipient: null,
      priority: "MEDIUM"
    });
  }

  async notifyUser(userId, message) {
    return await Notification.create({
      type: "User",
      message,
      recipient: userId,
      priority: "LOW"
    });
  }

  async notifyDeliveryEvent(deliveryId, message) {
    return await Notification.create({
      type: "DeliveryAlert",
      message,
      relatedId: deliveryId,
      relatedModule: "Delivery",
      priority: "MEDIUM"
    });
  }

  async notifyVehicleEvent(vehicleId, message) {
    return await Notification.create({
      type: "VehicleAlert",
      message,
      relatedId: vehicleId,
      relatedModule: "Vehicle",
      priority: "MEDIUM"
    });
  }

  async notifyReportEvent(reportId, message) {
    return await Notification.create({
      type: "ReportAlert",
      message,
      relatedId: reportId,
      relatedModule: "Report",
      priority: "LOW"
    });
  }

  async getAll() {
    return await Notification.findAll({
      order: [["createdAt", "DESC"]]
    });
  }

  async markAsRead(id) {
    const notif = await Notification.findByPk(id);
    if (!notif) throw new Error("Notification not found");

    await notif.update({ isRead: true });
    return notif;
  }
}

module.exports = NotificationService;
