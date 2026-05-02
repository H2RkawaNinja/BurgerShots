const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Tagesangebot = sequelize.define('Tagesangebot', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(120), allowNull: false },
  beschreibung: { type: DataTypes.TEXT, allowNull: true },
  bild: { type: DataTypes.STRING(255), allowNull: true },
  rabatt_prozent: { type: DataTypes.INTEGER, defaultValue: 0 },
  sonderpreis: { type: DataTypes.DECIMAL(8, 2), allowNull: true },
  menu_item_id: { type: DataTypes.INTEGER, allowNull: true },
  menue_id: { type: DataTypes.INTEGER, allowNull: true },
  gueltig_von: { type: DataTypes.DATEONLY, allowNull: true },
  gueltig_bis: { type: DataTypes.DATEONLY, allowNull: true },
  aktiv: { type: DataTypes.BOOLEAN, defaultValue: true },
  erstellt_von: { type: DataTypes.INTEGER, allowNull: true }
}, { tableName: 'tagesangebote' });

module.exports = Tagesangebot;
