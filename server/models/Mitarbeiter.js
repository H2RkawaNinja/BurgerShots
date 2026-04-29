const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/db');

const Mitarbeiter = sequelize.define('Mitarbeiter', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  benutzername: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  email: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  passwort: { type: DataTypes.STRING(255), allowNull: false },
  vorname: { type: DataTypes.STRING(50), allowNull: false },
  nachname: { type: DataTypes.STRING(50), allowNull: false },
  rollen_id: { type: DataTypes.INTEGER, allowNull: true },
  avatar: { type: DataTypes.STRING(255), allowNull: true },
  aktiv: { type: DataTypes.BOOLEAN, defaultValue: true },
  letzter_login: { type: DataTypes.DATE, allowNull: true },
  setup_token: { type: DataTypes.STRING(255), allowNull: true },
  setup_token_expiry: { type: DataTypes.DATE, allowNull: true }
}, {
  tableName: 'mitarbeiter',
  hooks: {
    beforeCreate: async (m) => { if (m.passwort) m.passwort = await bcrypt.hash(m.passwort, 10); },
    beforeUpdate: async (m) => { if (m.changed('passwort')) m.passwort = await bcrypt.hash(m.passwort, 10); }
  }
});

Mitarbeiter.prototype.checkPasswort = function(passwort) {
  return bcrypt.compare(passwort, this.passwort);
};

module.exports = Mitarbeiter;
