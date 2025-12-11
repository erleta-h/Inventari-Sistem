// modules/produkte/kategoria.model.js
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const Kategoria = sequelize.define("Kategoria", {
  KategoriaID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  emri: {
    type: DataTypes.STRING,
    allowNull: false
  },
  pershkrimi: {
    type: DataTypes.TEXT,
    allowNull: true
  }
});

module.exports = Kategoria;
