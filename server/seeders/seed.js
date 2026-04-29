const { Rolle, Recht, RolleRecht, Mitarbeiter, Kategorie, Zutat, Lagerbestand, HygieneCheckpunkt } = require('../models');
const sequelize = require('../config/db');

const RECHTE = [
  { schluessel: 'dashboard.stats', name: 'Dashboard-Statistiken', beschreibung: 'KPI-Kacheln sehen', kategorie: 'Statistiken' },
  { schluessel: 'speisekarte.ansehen', name: 'Speisekarte ansehen', beschreibung: '', kategorie: 'Speisekarte' },
  { schluessel: 'speisekarte.erstellen', name: 'Speisekarte erstellen', beschreibung: '', kategorie: 'Speisekarte' },
  { schluessel: 'speisekarte.bearbeiten', name: 'Speisekarte bearbeiten', beschreibung: '', kategorie: 'Speisekarte' },
  { schluessel: 'speisekarte.loeschen', name: 'Speisekarte löschen', beschreibung: '', kategorie: 'Speisekarte' },
  { schluessel: 'bestellungen.ansehen', name: 'Bestellungen ansehen', beschreibung: '', kategorie: 'Bestellungen' },
  { schluessel: 'bestellungen.verwalten', name: 'Bestellungen verwalten', beschreibung: '', kategorie: 'Bestellungen' },
  { schluessel: 'tagesangebote.verwalten', name: 'Tagesangebote verwalten', beschreibung: '', kategorie: 'Angebote' },
  { schluessel: 'lagerbestand.ansehen', name: 'Lagerbestand ansehen', beschreibung: '', kategorie: 'Lager' },
  { schluessel: 'lagerbestand.verwalten', name: 'Lagerbestand verwalten', beschreibung: '', kategorie: 'Lager' },
  { schluessel: 'statistiken.ansehen', name: 'Statistiken ansehen', beschreibung: '', kategorie: 'Statistiken' },
  { schluessel: 'mitarbeiter.ansehen', name: 'Mitarbeiter ansehen', beschreibung: '', kategorie: 'Mitarbeiter' },
  { schluessel: 'mitarbeiter.verwalten', name: 'Mitarbeiter verwalten', beschreibung: '', kategorie: 'Mitarbeiter' },
  { schluessel: 'rollen.verwalten', name: 'Rollen verwalten', beschreibung: '', kategorie: 'System' },
  { schluessel: 'log.ansehen', name: 'Aktivitätslog ansehen', beschreibung: '', kategorie: 'System' },
  { schluessel: 'hygiene.ansehen', name: 'Hygiene ansehen', beschreibung: 'Prüfprotokolle einsehen', kategorie: 'Hygiene' },
  { schluessel: 'hygiene.verwalten', name: 'Hygiene verwalten', beschreibung: 'Prüfungen erstellen und abschließen', kategorie: 'Hygiene' }
];

const KATEGORIEN = [
  { name: 'Burger', slug: 'burger', icon: '🍔', reihenfolge: 1 },
  { name: 'Chicken', slug: 'chicken', icon: '🍗', reihenfolge: 2 },
  { name: 'Sides', slug: 'sides', icon: '🍟', reihenfolge: 3 },
  { name: 'Salate', slug: 'salate', icon: '🥗', reihenfolge: 4 },
  { name: 'Drinks', slug: 'drinks', icon: '🥤', reihenfolge: 5 },
  { name: 'Desserts', slug: 'desserts', icon: '🍦', reihenfolge: 6 },
  { name: 'Saucen', slug: 'saucen', icon: '🫙', reihenfolge: 7 }
];

const ZUTATEN = [
  { name: 'Rinderhackfleisch (150g)', einheit: 'Stück', mindestbestand: 50, kategorie: 'Fleisch' },
  { name: 'Chicken Patty', einheit: 'Stück', mindestbestand: 50, kategorie: 'Fleisch' },
  { name: 'Brioche Bun', einheit: 'Stück', mindestbestand: 100, kategorie: 'Brot' },
  { name: 'Cheddar Scheiben', einheit: 'Stück', mindestbestand: 200, kategorie: 'Milchprodukte' },
  { name: 'Eisbergsalat', einheit: 'kg', mindestbestand: 5, kategorie: 'Gemüse' },
  { name: 'Tomaten', einheit: 'kg', mindestbestand: 5, kategorie: 'Gemüse' },
  { name: 'Zwiebeln', einheit: 'kg', mindestbestand: 5, kategorie: 'Gemüse' },
  { name: 'Pommes Frites (TK)', einheit: 'kg', mindestbestand: 20, kategorie: 'TK' },
  { name: 'Coca-Cola (0,5l)', einheit: 'Flasche', mindestbestand: 48, kategorie: 'Getränke' },
  { name: 'Burger-Sauce', einheit: 'kg', mindestbestand: 3, kategorie: 'Saucen' }
];

const seed = async () => {
  try {
    console.log('🌱 BurgerShot Seeding...\n');
    await sequelize.authenticate();
    console.log('✅ DB-Verbindung OK');
    await sequelize.sync({ force: true });
    console.log('✅ Tabellen erstellt\n');

    console.log('📝 Erstelle Rechte...');
    const rechte = await Recht.bulkCreate(RECHTE);
    console.log(`   ${rechte.length} Rechte erstellt\n`);

    console.log('👑 Erstelle Admin-Rolle...');
    const adminRolle = await Rolle.create({ name: 'Admin', farbe: '#C8171E', beschreibung: 'Vollzugriff' });
    await adminRolle.setRechte(rechte);
    console.log('   Admin-Rolle erstellt\n');

    console.log('👤 Erstelle Mitarbeiter-Rolle...');
    const maRolle = await Rolle.create({ name: 'Mitarbeiter', farbe: '#1B3F8B', beschreibung: 'Basis-Zugriff' });
    const basisRechte = rechte.filter(r => ['speisekarte.ansehen', 'bestellungen.ansehen', 'bestellungen.verwalten', 'dashboard.stats'].includes(r.schluessel));
    await maRolle.setRechte(basisRechte);
    console.log('   Mitarbeiter-Rolle erstellt\n');

    console.log('🔐 Erstelle Admin-Benutzer...');
    await Mitarbeiter.create({
      benutzername: 'admin',
      email: 'admin@burgershot.de',
      passwort: 'admin123',
      vorname: 'Admin',
      nachname: 'BurgerShot',
      rollen_id: adminRolle.id
    });
    console.log('   admin / admin123\n');

    console.log('📁 Erstelle Kategorien...');
    await Kategorie.bulkCreate(KATEGORIEN);
    console.log(`   ${KATEGORIEN.length} Kategorien\n`);

    console.log('🥩 Erstelle Zutaten + Lagerbestand...');
    for (const z of ZUTATEN) {
      const zutat = await Zutat.create(z);
      await Lagerbestand.create({ zutat_id: zutat.id, menge_aktuell: z.mindestbestand * 2 });
    }
    console.log(`   ${ZUTATEN.length} Zutaten mit Anfangsbestand\n`);

    console.log('🧹 Erstelle Hygiene-Checkpunkte...');
    const HYGIENE_CHECKPUNKTE = [
      // Küche
      { bezeichnung: 'Arbeitsflächen gereinigt und desinfiziert', bereich: 'Küche', reihenfolge: 1 },
      { bezeichnung: 'Grill / Fritteuse gereinigt', bereich: 'Küche', reihenfolge: 2 },
      { bezeichnung: 'Kühlschrank Temperatur geprüft (max. 7°C)', bereich: 'Küche', reihenfolge: 3 },
      { bezeichnung: 'Tiefkühler Temperatur geprüft (max. -18°C)', bereich: 'Küche', reihenfolge: 4 },
      { bezeichnung: 'Schneidbretter gereinigt und desinfiziert', bereich: 'Küche', reihenfolge: 5 },
      { bezeichnung: 'Abzugshaube gereinigt', bereich: 'Küche', reihenfolge: 6 },
      { bezeichnung: 'Ofen / Backofen innen gereinigt', bereich: 'Küche', reihenfolge: 7 },
      { bezeichnung: 'Tiefkühler abgetaut und gereinigt', bereich: 'Küche', reihenfolge: 8 },
      // Lager
      { bezeichnung: 'Lebensmittel korrekt gelagert (getrennt, beschriftet)', bereich: 'Lager', reihenfolge: 9 },
      { bezeichnung: 'Abgelaufene Waren entfernt und entsorgt', bereich: 'Lager', reihenfolge: 10 },
      { bezeichnung: 'Lager auf Schädlinge geprüft', bereich: 'Lager', reihenfolge: 11 },
      // Sanitär
      { bezeichnung: 'WC gereinigt und desinfiziert', bereich: 'Sanitär', reihenfolge: 12 },
      { bezeichnung: 'Seifenspender aufgefüllt', bereich: 'Sanitär', reihenfolge: 13 },
      { bezeichnung: 'Papierhandtücher / Einweghandtücher nachgefüllt', bereich: 'Sanitär', reihenfolge: 14 },
      // Allgemein
      { bezeichnung: 'Böden gefegt und feucht gewischt', bereich: 'Allgemein', reihenfolge: 15 },
      { bezeichnung: 'Müll entsorgt und Behälter gereinigt', bereich: 'Allgemein', reihenfolge: 16 },
      { bezeichnung: 'Kundenbereich gereinigt', bereich: 'Allgemein', reihenfolge: 17 },
      { bezeichnung: 'Schutzhandschuhe vorhanden', bereich: 'Allgemein', reihenfolge: 18 },
      { bezeichnung: 'Erste-Hilfe-Kasten vollständig', bereich: 'Allgemein', reihenfolge: 19 },
    ];
    await HygieneCheckpunkt.bulkCreate(HYGIENE_CHECKPUNKTE);
    console.log(`   ${HYGIENE_CHECKPUNKTE.length} Checkpunkte erstellt\n`);

    console.log('═══════════════════════════════════════════');
    console.log('✅ SEEDING ABGESCHLOSSEN!');
    console.log('   Login: admin / admin123');
    console.log('═══════════════════════════════════════════\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding fehlgeschlagen:', error);
    process.exit(1);
  }
};

seed();
