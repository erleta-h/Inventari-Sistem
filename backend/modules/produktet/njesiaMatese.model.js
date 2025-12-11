// modules/produkte/njesiaMatese.model.js
const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const NjesiaMatese = sequelize.define("NjesiaMatese", {
  ID_Njesia: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  emri: {
    type: DataTypes.STRING,
    allowNull: false
  },
  shkurtesa: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

module.exports = NjesiaMatese;
