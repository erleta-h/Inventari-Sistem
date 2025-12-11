const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db.js");

const Vehicle = sequelize.define("Vehicle", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  plateNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },

  type: {
    type: DataTypes.ENUM("CAR", "VAN", "TRUCK"),
    allowNull: false
  },

  capacity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  status: {
    type: DataTypes.ENUM("Available", "InUse", "Maintenance"),
    allowNull: false,
    defaultValue: "Available"
  },

  fuelLevel: {
    type: DataTypes.INTEGER,
    allowNull: true
  },

  lastMaintenance: {
    type: DataTypes.DATE,
    allowNull: true
  },

  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
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

module.exports = Vehicle;
