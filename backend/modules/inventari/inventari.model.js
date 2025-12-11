const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const Inventari = sequelize.define("Inventari", {
  inventariId: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  sasia: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },

  minimum_sasia: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
});

module.exports = Inventari;
