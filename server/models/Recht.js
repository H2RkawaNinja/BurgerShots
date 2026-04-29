const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Recht = sequelize.define('Recht', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  schluessel: { type: DataTypes.STRING(80), allowNull: false, unique: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  beschreibung: { type: DataTypes.TEXT, allowNull: true },
  kategorie: { type: DataTypes.STRING(50), allowNull: true }
}, { tableName: 'rechte' });

module.exports = Recht;
