const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db.js");

const Delivery = sequelize.define("Delivery", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  status: {
    type: DataTypes.ENUM("PENDING", "ASSIGNED", "ON_THE_WAY", "DELIVERED", "FAILED"),
    allowNull: false,
    defaultValue: "PENDING"
  },

  currentLocation: {
    type: DataTypes.STRING,
    allowNull: true
  },

  expectedDeliveryTime: {
    type: DataTypes.DATE,
    allowNull: true
  },

  notes: {
    type: DataTypes.STRING,
    allowNull: true
  },

  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },

  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

module.exports = Delivery;
