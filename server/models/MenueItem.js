const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const MenueItem = sequelize.define('MenueItem', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  menue_id: { type: DataTypes.INTEGER, allowNull: false },
  menu_item_id: { type: DataTypes.INTEGER, allowNull: false },
  menge: { type: DataTypes.INTEGER, defaultValue: 1 },
}, { tableName: 'menue_items', timestamps: false });

module.exports = MenueItem;
