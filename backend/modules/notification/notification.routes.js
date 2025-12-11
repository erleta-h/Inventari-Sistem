const express = require("express");
const NotificationController = require("./notification.controller.js");
const { validateNotification } = require("./notification.validation.js");

const router = express.Router();
const controller = new NotificationController();

// Get all notifications
router.get("/", controller.getAll);

// Mark notification as read
router.patch("/:id/read", controller.markAsRead);

// Send notification manually to a user
router.post("/user", validateNotification, controller.sendToUser);

module.exports = router;
