const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const Order = sequelize.define("Order", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  createdBy: {
    type: DataTypes.INTEGER,  
    allowNull: false
  },

  status: {
    type: DataTypes.ENUM("pending", "approved", "rejected", "completed"),
    defaultValue: "pending"
  },

  koment: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  dataKrijimit: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },

  dataKompletimit: {
    type: DataTypes.DATE,
    allowNull: true
  }
});

module.exports = Order;

