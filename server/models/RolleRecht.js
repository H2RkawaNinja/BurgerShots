const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const RolleRecht = sequelize.define('RolleRecht', {
  rollen_id: { type: DataTypes.INTEGER, allowNull: false },
  recht_id: { type: DataTypes.INTEGER, allowNull: false }
}, { tableName: 'rollen_rechte', timestamps: false });

module.exports = RolleRecht;
