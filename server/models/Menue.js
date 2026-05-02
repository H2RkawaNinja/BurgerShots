const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Menue = sequelize.define('Menue', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(120), allowNull: false },
  beschreibung: { type: DataTypes.TEXT, allowNull: true },
  preis: { type: DataTypes.DECIMAL(8, 2), allowNull: false },
  bild: { type: DataTypes.STRING(255), allowNull: true },
  verfuegbar: { type: DataTypes.BOOLEAN, defaultValue: true },
  erstellt_von: { type: DataTypes.INTEGER, allowNull: true },
}, { tableName: 'menues' });

module.exports = Menue;
