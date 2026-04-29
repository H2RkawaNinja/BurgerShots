const express = require('express');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { Mitarbeiter, Rolle, Recht } = require('../models');
const { logAktion } = require('../utils/logger');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { benutzername, passwort } = req.body;
    if (!benutzername || !passwort) {
      return res.status(400).json({ error: 'Benutzername und Passwort erforderlich.' });
    }

    const mitarbeiter = await Mitarbeiter.findOne({
      where: { [Op.or]: [{ benutzername }, { email: benutzername }] },
      include: [{ model: Rolle, as: 'rolle', include: [{ model: Recht, as: 'rechte' }] }]
    });

    if (!mitarbeiter) return res.status(401).json({ error: 'Ungültige Anmeldedaten.' });
    if (!mitarbeiter.aktiv) return res.status(401).json({ error: 'Account ist deaktiviert.' });

    const isValid = await mitarbeiter.checkPasswort(passwort);
    if (!isValid) return res.status(401).json({ error: 'Ungültige Anmeldedaten.' });

    await mitarbeiter.update({ letzter_login: new Date() });
    logAktion(`Login: ${mitarbeiter.benutzername}`, 'Auth', mitarbeiter, { rolle: mitarbeiter.rolle?.name });

    const token = jwt.sign({ id: mitarbeiter.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });

    const rechte = mitarbeiter.rolle?.rechte?.map(r => r.schluessel) || [];

    res.json({
      message: 'Login erfolgreich!',
      token,
      mitarbeiter: {
        id: mitarbeiter.id,
        benutzername: mitarbeiter.benutzername,
        email: mitarbeiter.email,
        vorname: mitarbeiter.vorname,
        nachname: mitarbeiter.nachname,
        rolle: mitarbeiter.rolle?.name,
        rollenFarbe: mitarbeiter.rolle?.farbe
      },
      rechte
    });
  } catch (error) {
    console.error('Login Fehler:', error);
    res.status(500).json({ error: 'Serverfehler beim Login.' });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req, res) => {
  const rechte = req.mitarbeiter.rolle?.rechte?.map(r => r.schluessel) || [];
  res.json({
    mitarbeiter: {
      id: req.mitarbeiter.id,
      benutzername: req.mitarbeiter.benutzername,
      email: req.mitarbeiter.email,
      vorname: req.mitarbeiter.vorname,
      nachname: req.mitarbeiter.nachname,
      rolle: req.mitarbeiter.rolle?.name,
      rollenFarbe: req.mitarbeiter.rolle?.farbe
    },
    rechte
  });
});

// PUT /api/auth/passwort
router.put('/passwort', authenticate, async (req, res) => {
  try {
    const { altesPasswort, neuesPasswort } = req.body;
    if (!altesPasswort || !neuesPasswort) {
      return res.status(400).json({ error: 'Altes und neues Passwort erforderlich.' });
    }
    if (neuesPasswort.length < 6) {
      return res.status(400).json({ error: 'Passwort muss mindestens 6 Zeichen lang sein.' });
    }
    const valid = await req.mitarbeiter.checkPasswort(altesPasswort);
    if (!valid) return res.status(401).json({ error: 'Altes Passwort ist falsch.' });
    await req.mitarbeiter.update({ passwort: neuesPasswort });
    logAktion('Passwort geändert', 'Auth', req.mitarbeiter, {});
    res.json({ message: 'Passwort erfolgreich geändert.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Serverfehler.' });
  }
});

module.exports = router;
