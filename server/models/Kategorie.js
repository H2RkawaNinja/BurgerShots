const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Kategorie = sequelize.define('Kategorie', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(80), allowNull: false, unique: true },
  slug: { type: DataTypes.STRING(80), allowNull: false, unique: true },
  icon: { type: DataTypes.STRING(10), defaultValue: '🍔' },
  reihenfolge: { type: DataTypes.INTEGER, defaultValue: 99 },
  aktiv: { type: DataTypes.BOOLEAN, defaultValue: true }
}, { tableName: 'kategorien' });

module.exports = Kategorie;
