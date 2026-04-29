/**
 * Migration: Hygiene-Rechte hinzufügen
 * Fügt hygiene.ansehen + hygiene.verwalten zur DB hinzu
 * und weist sie der Admin-Rolle zu.
 * Bestehende Daten bleiben erhalten.
 */

const { Rolle, Recht, RolleRecht } = require('../models');
const sequelize = require('../config/db');

const run = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ DB-Verbindung OK');

    // Tabellen anlegen falls noch nicht vorhanden (neue Hygiene-Tabellen)
    await sequelize.sync({ alter: true });
    console.log('✅ Tabellen synchronisiert\n');

    // Rechte einfügen (ignoriert Duplikate)
    const [r1] = await Recht.findOrCreate({
      where: { schluessel: 'hygiene.ansehen' },
      defaults: { name: 'Hygiene ansehen', beschreibung: 'Prüfprotokolle einsehen', kategorie: 'Hygiene' }
    });
    const [r2] = await Recht.findOrCreate({
      where: { schluessel: 'hygiene.verwalten' },
      defaults: { name: 'Hygiene verwalten', beschreibung: 'Prüfungen erstellen und abschliessen', kategorie: 'Hygiene' }
    });
    console.log('✅ Hygiene-Rechte erstellt/gefunden');

    // Admin-Rolle finden und Rechte zuweisen
    const adminRolle = await Rolle.findOne({ where: { name: 'Admin' } });
    if (adminRolle) {
      await adminRolle.addRechte([r1, r2]);
      console.log('✅ Admin-Rolle: Hygiene-Rechte zugewiesen');
    } else {
      console.warn('⚠️  Admin-Rolle nicht gefunden – bitte manuell zuweisen.');
    }

    console.log('\n✅ Migration abgeschlossen! Server neu starten.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Fehler:', error.message);
    process.exit(1);
  }
};

run();
