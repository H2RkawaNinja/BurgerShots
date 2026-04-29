const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const HygienePruefung = sequelize.define('HygienePruefung', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  typ: {
    type: DataTypes.ENUM('taeglich', 'woechentlich', 'monatlich', 'sonder'),
    defaultValue: 'taeglich'
  },
  datum: { type: DataTypes.DATEONLY, allowNull: false },
  mitarbeiter_id: { type: DataTypes.INTEGER, allowNull: true },
  abgeschlossen: { type: DataTypes.BOOLEAN, defaultValue: false },
  abgeschlossen_am: { type: DataTypes.DATE, allowNull: true },
  notiz: { type: DataTypes.TEXT, allowNull: true }
}, { tableName: 'hygiene_pruefungen' });

module.exports = HygienePruefung;
