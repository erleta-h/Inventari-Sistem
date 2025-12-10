const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const Produkti = sequelize.define("Produkti", {
  produktiId: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },

  emri: {
    type: DataTypes.STRING,
    allowNull: false
  },

  kodi: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },

  kategoria: {
    type: DataTypes.STRING,
    allowNull: false
  },

  brendi: {
    type: DataTypes.STRING,
    allowNull: true
  },

  uniteti: {
  type: DataTypes.ENUM("cope", "pako", "liter", "kg", "rrolle", "bidon"),
  allowNull: false,
  defaultValue: "cope"
},

  pershkrimi: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  qmimi: {
    type: DataTypes.FLOAT,
    allowNull: false
  },


});

module.exports = Produkti;
