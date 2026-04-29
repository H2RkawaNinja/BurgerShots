const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const MenuItem = sequelize.define('MenuItem', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(120), allowNull: false },
  beschreibung: { type: DataTypes.TEXT, allowNull: true },
  preis: { type: DataTypes.DECIMAL(8, 2), allowNull: false },
  kategorie_id: { type: DataTypes.INTEGER, allowNull: true },
  bild: { type: DataTypes.STRING(255), allowNull: true },
  kalorien: { type: DataTypes.INTEGER, allowNull: true },
  verfuegbar: { type: DataTypes.BOOLEAN, defaultValue: true },
  featured: { type: DataTypes.BOOLEAN, defaultValue: false },
  beliebt: { type: DataTypes.BOOLEAN, defaultValue: false },
  neu: { type: DataTypes.BOOLEAN, defaultValue: false },
  vegetarisch: { type: DataTypes.BOOLEAN, defaultValue: false },
  vegan: { type: DataTypes.BOOLEAN, defaultValue: false },
  scharf: { type: DataTypes.BOOLEAN, defaultValue: false },
  allergene: { type: DataTypes.TEXT, allowNull: true },
  erstellt_von: { type: DataTypes.INTEGER, allowNull: true },
  aktualisiert_von: { type: DataTypes.INTEGER, allowNull: true }
}, { tableName: 'menu_items' });

module.exports = MenuItem;
