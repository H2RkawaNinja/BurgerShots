const sequelize = require('../config/db');

const Rolle = require('./Rolle');
const Recht = require('./Recht');
const RolleRecht = require('./RolleRecht');
const Mitarbeiter = require('./Mitarbeiter');
const Kategorie = require('./Kategorie');
const MenuItem = require('./MenuItem');
const Bestellung = require('./Bestellung');
const BestellungItem = require('./BestellungItem');
const Tagesangebot = require('./Tagesangebot');
const Zutat = require('./Zutat');
const Lagerbestand = require('./Lagerbestand');
const AktivitaetsLog = require('./AktivitaetsLog');
const Einstellung = require('./Einstellung');
const HygieneCheckpunkt = require('./HygieneCheckpunkt');
const HygienePruefung = require('./HygienePruefung');
const HygieneEintrag = require('./HygieneEintrag');
const Menue = require('./Menue');
const MenueItem = require('./MenueItem');

// Rolle <-> Recht (Many-to-Many)
Rolle.belongsToMany(Recht, { through: RolleRecht, foreignKey: 'rollen_id', otherKey: 'recht_id', as: 'rechte' });
Recht.belongsToMany(Rolle, { through: RolleRecht, foreignKey: 'recht_id', otherKey: 'rollen_id', as: 'rollen' });

// Mitarbeiter -> Rolle
Mitarbeiter.belongsTo(Rolle, { foreignKey: 'rollen_id', as: 'rolle' });
Rolle.hasMany(Mitarbeiter, { foreignKey: 'rollen_id', as: 'mitarbeiter' });

// MenuItem -> Kategorie
MenuItem.belongsTo(Kategorie, { foreignKey: 'kategorie_id', as: 'kategorie' });
Kategorie.hasMany(MenuItem, { foreignKey: 'kategorie_id', as: 'menu_items' });

// MenuItem -> Mitarbeiter (erstellt von)
MenuItem.belongsTo(Mitarbeiter, { foreignKey: 'erstellt_von', as: 'ersteller' });

// Bestellung -> Mitarbeiter
Bestellung.belongsTo(Mitarbeiter, { foreignKey: 'mitarbeiter_id', as: 'mitarbeiter' });
Mitarbeiter.hasMany(Bestellung, { foreignKey: 'mitarbeiter_id', as: 'bestellungen' });

// BestellungItem -> Bestellung
Bestellung.hasMany(BestellungItem, { foreignKey: 'bestellung_id', as: 'items' });
BestellungItem.belongsTo(Bestellung, { foreignKey: 'bestellung_id', as: 'bestellung' });

// BestellungItem -> MenuItem
BestellungItem.belongsTo(MenuItem, { foreignKey: 'menu_item_id', as: 'menu_item' });
MenuItem.hasMany(BestellungItem, { foreignKey: 'menu_item_id', as: 'bestellung_items' });

// Tagesangebot -> Mitarbeiter
Tagesangebot.belongsTo(Mitarbeiter, { foreignKey: 'erstellt_von', as: 'ersteller' });
Tagesangebot.belongsTo(MenuItem, { foreignKey: 'menu_item_id', as: 'menu_item' });

// Lagerbestand -> Zutat
Lagerbestand.belongsTo(Zutat, { foreignKey: 'zutat_id', as: 'zutat' });
Zutat.hasOne(Lagerbestand, { foreignKey: 'zutat_id', as: 'lagerbestand' });
Lagerbestand.belongsTo(Mitarbeiter, { foreignKey: 'aktualisiert_von', as: 'aktualisierer' });

// HygienePruefung -> Mitarbeiter
HygienePruefung.belongsTo(Mitarbeiter, { foreignKey: 'mitarbeiter_id', as: 'mitarbeiter' });
Mitarbeiter.hasMany(HygienePruefung, { foreignKey: 'mitarbeiter_id', as: 'hygiene_pruefungen' });

// HygienePruefung -> HygieneEintrag
HygienePruefung.hasMany(HygieneEintrag, { foreignKey: 'pruefung_id', as: 'eintraege' });
HygieneEintrag.belongsTo(HygienePruefung, { foreignKey: 'pruefung_id', as: 'pruefung' });

// Menue <-> MenuItem (durch MenueItem)
Menue.hasMany(MenueItem, { foreignKey: 'menue_id', as: 'menue_items' });
MenueItem.belongsTo(Menue, { foreignKey: 'menue_id', as: 'menue' });
MenueItem.belongsTo(MenuItem, { foreignKey: 'menu_item_id', as: 'menu_item' });
MenuItem.hasMany(MenueItem, { foreignKey: 'menu_item_id', as: 'menue_zuordnungen' });

module.exports = {
  sequelize,
  Rolle,
  Recht,
  RolleRecht,
  Mitarbeiter,
  Kategorie,
  MenuItem,
  Bestellung,
  BestellungItem,
  Tagesangebot,
  Zutat,
  Lagerbestand,
  AktivitaetsLog,
  Einstellung,
  HygieneCheckpunkt,
  HygienePruefung,
  HygieneEintrag,
  Menue,
  MenueItem
};
