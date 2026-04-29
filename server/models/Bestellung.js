const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Bestellung = sequelize.define('Bestellung', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  bestellnummer: { type: DataTypes.STRING(20), allowNull: false, unique: true },
  status: {
    type: DataTypes.ENUM('offen', 'zubereitung', 'fertig', 'abgeholt', 'storniert'),
    defaultValue: 'offen'
  },
  gesamtbetrag: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  notiz: { type: DataTypes.TEXT, allowNull: true },
  tisch_nr: { type: DataTypes.STRING(10), allowNull: true },
  mitarbeiter_id: { type: DataTypes.INTEGER, allowNull: true }
}, { tableName: 'bestellungen' });

module.exports = Bestellung;
