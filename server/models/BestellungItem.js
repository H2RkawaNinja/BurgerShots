const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const BestellungItem = sequelize.define('BestellungItem', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  bestellung_id: { type: DataTypes.INTEGER, allowNull: false },
  menu_item_id: { type: DataTypes.INTEGER, allowNull: false },
  menge: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  preis_einzeln: { type: DataTypes.DECIMAL(8, 2), allowNull: false },
  notiz: { type: DataTypes.STRING(255), allowNull: true }
}, { tableName: 'bestellung_items' });

module.exports = BestellungItem;
