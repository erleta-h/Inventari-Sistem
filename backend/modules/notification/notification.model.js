const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db.js");

const Notification = sequelize.define("Notification", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  type: {
    type: DataTypes.ENUM("System", "User", "DeliveryAlert", "VehicleAlert", "ReportAlert"),
    allowNull: false
  },

  message: {
    type: DataTypes.STRING,
    allowNull: false
  },

  recipient: {
    type: DataTypes.INTEGER,
    allowNull: true  // nëse është null → njoftim sistemik
  },

  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },

  priority: {
    type: DataTypes.ENUM("LOW", "MEDIUM", "HIGH"),
    defaultValue: "LOW"
  },

  relatedId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },

  relatedModule: {
    type: DataTypes.ENUM("Delivery", "Vehicle", "Tracking", "Report"),
    allowNull: true
  },

  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

module.exports = Notification;
