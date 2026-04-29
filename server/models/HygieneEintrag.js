const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const HygieneEintrag = sequelize.define('HygieneEintrag', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  pruefung_id: { type: DataTypes.INTEGER, allowNull: false },
  checkpoint_id: { type: DataTypes.INTEGER, allowNull: true },
  bezeichnung: { type: DataTypes.STRING(200), allowNull: false },
  bereich: { type: DataTypes.STRING(100), allowNull: false },
  erledigt: { type: DataTypes.BOOLEAN, defaultValue: false },
  bemerkung: { type: DataTypes.TEXT, allowNull: true }
}, { tableName: 'hygiene_eintraege' });

module.exports = HygieneEintrag;
