// IMPORTO MODELET ME COMMONJS
const Delivery = require("../modules/delivery/delivery.model");
const Vehicle = require("../modules/vehicle/vehicle.model");
const Tracking = require("../modules/tracking/tracking.model");
const Report = require("../modules/report/report.model");
const Notification = require("../modules/notification/notification.model");


function applyAssociations() {

  // VEHICLE ↔ DELIVERY
  Vehicle.hasMany(Delivery, {
    foreignKey: "vehicleId",
    as: "deliveries"
  });

  Delivery.belongsTo(Vehicle, {
    foreignKey: "vehicleId",
    as: "vehicle"
  });

  /*
  // USER ↔ DELIVERY (driver)
  User.hasMany(Delivery, {
    foreignKey: "driverId",
    as: "driverDeliveries"
  });*/

  /*
  Delivery.belongsTo(User, {
    foreignKey: "driverId",
    as: "driver"
  });*/

  // DELIVERY ↔ TRACKING
  Delivery.hasMany(Tracking, {
    foreignKey: "deliveryId",
    as: "trackingPoints"
  });

  Tracking.belongsTo(Delivery, {
    foreignKey: "deliveryId",
    as: "delivery"
  });
/*
  // USER ↔ REPORT
  User.hasMany(Report, {
    foreignKey: "createdBy",
    as: "createdReports"
  });

  Report.belongsTo(User, {
    foreignKey: "createdBy",
    as: "creator"
  });

  // USER ↔ NOTIFICATIONS
  User.hasMany(Notification, {
    foreignKey: "recipient",
    as: "notifications"
  });

  Notification.belongsTo(User, {
    foreignKey: "recipient",
    as: "user"
  });*/

  // DELIVERY ↔ NOTIFICATIONS (optional)
  Delivery.hasMany(Notification, {
    foreignKey: "relatedId",
    constraints: false,
    scope: { relatedModule: "Delivery" },
    as: "deliveryNotifications"
  });
}

// EXPORTO FUNKSIONIN ME COMMONJS
module.exports = applyAssociations;
