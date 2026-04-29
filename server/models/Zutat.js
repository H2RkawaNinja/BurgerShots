const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Zutat = sequelize.define('Zutat', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  einheit: { type: DataTypes.STRING(20), defaultValue: 'Stück' },
  mindestbestand: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  kategorie: { type: DataTypes.STRING(50), allowNull: true },
  aktiv: { type: DataTypes.BOOLEAN, defaultValue: true }
}, { tableName: 'zutaten' });

module.exports = Zutat;
