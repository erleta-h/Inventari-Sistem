const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const Depo = sequelize.define("Depo", {
  depoId: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  emri: {
    type: DataTypes.STRING,
    allowNull: false
  },

  lokacioni: {
    type: DataTypes.STRING,
    allowNull: false
  },

  kapaciteti: {
    type: DataTypes.INTEGER,
    allowNull: true
  },

  pershkrimi: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  statusi: {
    type: DataTypes.ENUM("aktiv", "jo_aktiv"),
    defaultValue: "aktiv"
  }
});

module.exports = Depo;
