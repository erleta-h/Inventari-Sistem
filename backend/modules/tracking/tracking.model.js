const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db.js");

const Tracking = sequelize.define("Tracking", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },


  latitude: {
    type: DataTypes.FLOAT,
    allowNull: false
  },

  longitude: {
    type: DataTypes.FLOAT,
    allowNull: false
  },

  speed: {
    type: DataTypes.FLOAT,
    allowNull: true
  },

  address: {
    type: DataTypes.STRING,
    allowNull: true
  },

  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

module.exports = Tracking;
