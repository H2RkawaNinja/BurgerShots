const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Rolle = sequelize.define('Rolle', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  farbe: { type: DataTypes.STRING(7), defaultValue: '#6B7280' },
  beschreibung: { type: DataTypes.TEXT, allowNull: true }
}, { tableName: 'rollen' });

module.exports = Rolle;
