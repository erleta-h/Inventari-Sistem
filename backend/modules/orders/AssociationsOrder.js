const Order = require("./OrderModel.js");
const OrderItem = require("./OrderItemModel.js");
const User = require("../users/UserModel.js");

Order.hasMany(OrderItem, {
  foreignKey: "orderId",
  as: "items",
  onDelete: "CASCADE"
});

OrderItem.belongsTo(Order, {
  foreignKey: "orderId",
  as: "order"
});

User.hasMany(Order, {
  foreignKey: "createdBy",
  as: "orders"
});

Order.belongsTo(User, {
  foreignKey: "createdBy",
  as: "user"
});

module.exports = { Order, OrderItem, User };
