const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Lagerbestand = sequelize.define('Lagerbestand', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  zutat_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  menge_aktuell: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  letzte_aktualisierung: { type: DataTypes.DATE, allowNull: true },
  aktualisiert_von: { type: DataTypes.INTEGER, allowNull: true },
  notiz: { type: DataTypes.TEXT, allowNull: true }
}, { tableName: 'lagerbestand' });

module.exports = Lagerbestand;
