const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const OrderItem = sequelize.define("OrderItem", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  orderId: {
    type: DataTypes.INTEGER,     // Lidhja me Order
    allowNull: false
  },

  sasia: {
    type: DataTypes.INTEGER,     // Sa copë kërkohen
    allowNull: false
  }
});

module.exports = OrderItem;
