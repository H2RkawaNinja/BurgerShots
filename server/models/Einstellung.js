const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Einstellung = sequelize.define('Einstellung', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  schluessel: { type: DataTypes.STRING(80), allowNull: false, unique: true },
  wert: { type: DataTypes.TEXT, allowNull: true },
  typ: { type: DataTypes.ENUM('string', 'number', 'boolean', 'json'), defaultValue: 'string' }
}, { tableName: 'einstellungen' });

module.exports = Einstellung;
