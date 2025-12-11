const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db.js");

const Report = sequelize.define("Report", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  type: {
    type: DataTypes.ENUM("DeliveryReport", "VehicleReport", "TrackingReport"),
    allowNull: false
  },

  generatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },

  data: {
    type: DataTypes.JSON,
    allowNull: false
  },

  filters: {
    type: DataTypes.JSON,
    allowNull: true
  },

  periodStart: {
    type: DataTypes.DATE,
    allowNull: true
  },

  periodEnd: {
    type: DataTypes.DATE,
    allowNull: true
  },

  status: {
    type: DataTypes.ENUM("OK", "ERROR"),
    defaultValue: "OK"
  }
});

module.exports = Report;
