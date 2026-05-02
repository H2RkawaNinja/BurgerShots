const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const sequelize = require('./config/db');
require('./models');

const authRoutes = require('./routes/auth');
const menuRoutes = require('./routes/menu');
const kategorienRoutes = require('./routes/kategorien');
const bestellungenRoutes = require('./routes/bestellungen');
const tagesangeboteRoutes = require('./routes/tagesangebote');
const lagerbestandRoutes = require('./routes/lagerbestand');
const statsRoutes = require('./routes/stats');
const mitarbeiterRoutes = require('./routes/mitarbeiter');
const rollenRoutes = require('./routes/rollen');
const rechteRoutes = require('./routes/rechte');
const logRoutes = require('./routes/log');
const hygieneRoutes = require('./routes/hygiene');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL
    : 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/kategorien', kategorienRoutes);
app.use('/api/bestellungen', bestellungenRoutes);
app.use('/api/tagesangebote', tagesangeboteRoutes);
app.use('/api/lagerbestand', lagerbestandRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/mitarbeiter', mitarbeiterRoutes);
app.use('/api/rollen', rollenRoutes);
app.use('/api/rechte', rechteRoutes);
app.use('/api/log', logRoutes);
app.use('/api/hygiene', hygieneRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'BurgerShot API läuft!' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Interner Serverfehler',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route nicht gefunden' });
});

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL Verbindung erfolgreich!');

    await sequelize.sync({ alter: true });
    console.log('✅ Datenbank synchronisiert!');

    const { Recht } = require('./models');
    const RECHTE = [
      { schluessel: 'dashboard.stats', name: 'Dashboard-Statistiken', beschreibung: 'Kann KPI-Kacheln sehen', kategorie: 'Statistiken' },
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
      { schluessel: 'log.ansehen', name: 'Aktivitätslog ansehen', beschreibung: '', kategorie: 'System' }
    ];
    for (const r of RECHTE) await Recht.upsert(r);

    app.listen(PORT, () => {
      console.log(`🍔 BurgerShot Server läuft auf Port ${PORT}`);
      console.log(`📦 API: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Datenbankverbindung fehlgeschlagen:', error);
    process.exit(1);
  }
};

startServer();
