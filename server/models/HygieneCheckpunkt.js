const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const HygieneCheckpunkt = sequelize.define('HygieneCheckpunkt', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  bezeichnung: { type: DataTypes.STRING(200), allowNull: false },
  bereich: { type: DataTypes.STRING(100), allowNull: false },
  reihenfolge: { type: DataTypes.INTEGER, defaultValue: 0 },
  aktiv: { type: DataTypes.BOOLEAN, defaultValue: true }
}, { tableName: 'hygiene_checkpunkte' });

module.exports = HygieneCheckpunkt;
