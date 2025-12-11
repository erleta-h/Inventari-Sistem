const NotificationService = require("./notification.service.js");

class NotificationController {
  constructor() {
    this.notificationService = new NotificationService();
  }

  getAll = async (req, res) => {
    try {
      const notifications = await this.notificationService.getAll();
      res.json(notifications);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  markAsRead = async (req, res) => {
    try {
      const notif = await this.notificationService.markAsRead(req.params.id);
      res.json(notif);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

  sendToUser = async (req, res) => {
    try {
      const { userId, message } = req.body;
      const notif = await this.notificationService.notifyUser(userId, message);
      res.status(201).json(notif);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
}

module.exports = NotificationController;
