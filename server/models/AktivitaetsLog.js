const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const AktivitaetsLog = sequelize.define('AktivitaetsLog', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  aktion: { type: DataTypes.STRING(255), allowNull: false },
  kategorie: { type: DataTypes.STRING(50), allowNull: true },
  mitarbeiter_id: { type: DataTypes.INTEGER, allowNull: true },
  mitarbeiter_name: { type: DataTypes.STRING(100), allowNull: true },
  details: { type: DataTypes.JSON, allowNull: true }
}, { tableName: 'aktivitaetslog', updatedAt: false });

module.exports = AktivitaetsLog;
