const { DataTypes } = require("sequelize");
const sequelize = require("../../config/db");

const Supply = sequelize.define("Supply", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },


  depoId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  sasia: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  dataFurnizimit: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },

  emriFurnitorit: {
    type: DataTypes.STRING,
    allowNull: true
  },

  nrTelefonit: {
    type: DataTypes.STRING,
    allowNull: true
  },

  emailFurnitorit: {
    type: DataTypes.STRING,
    allowNull: true
  },

  reference: {
    type: DataTypes.STRING,
    allowNull: true  // nr. fature, fletë-dërgimi, dokument i jashtëm
  },

  koment: {
    type: DataTypes.TEXT,
    allowNull: true  // shënime nga magazinieri
  },

  createdBy: {
    type: DataTypes.INTEGER,  // lidhje me Users (magazinieri që e ka futur)
    allowNull: false
  }
});

module.exports = Supply;

