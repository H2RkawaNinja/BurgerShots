const express = require('express');
const crypto = require('crypto');
const { Mitarbeiter, Rolle } = require('../models');
const { authenticate, requirePermission } = require('../middleware/auth');
const { logAktion } = require('../utils/logger');

const router = express.Router();

router.get('/', authenticate, requirePermission('mitarbeiter.ansehen'), async (req, res) => {
  try {
    const mitarbeiter = await Mitarbeiter.findAll({
      include: [{ model: Rolle, as: 'rolle', attributes: ['id', 'name', 'farbe'] }],
      attributes: { exclude: ['passwort', 'setup_token', 'setup_token_expiry'] },
      order: [['vorname', 'ASC']]
    });
    res.json(mitarbeiter);
  } catch (error) {
    res.status(500).json({ error: 'Serverfehler.' });
  }
});

router.post('/', authenticate, requirePermission('mitarbeiter.verwalten'), async (req, res) => {
  try {
    const { vorname, nachname, benutzername, email, rollen_id } = req.body;
    const tempPasswort = crypto.randomBytes(8).toString('hex');
    const m = await Mitarbeiter.create({ vorname, nachname, benutzername, email, passwort: tempPasswort, rollen_id });
    logAktion(`Mitarbeiter erstellt: ${m.vorname} ${m.nachname}`, 'Mitarbeiter', req.mitarbeiter, {});
    res.status(201).json({ ...m.toJSON(), passwort: undefined, tempPasswort });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'Benutzername oder E-Mail bereits vergeben.' });
    }
    res.status(500).json({ error: 'Serverfehler.' });
  }
});

router.put('/:id', authenticate, requirePermission('mitarbeiter.verwalten'), async (req, res) => {
  try {
    const m = await Mitarbeiter.findByPk(req.params.id);
    if (!m) return res.status(404).json({ error: 'Nicht gefunden.' });
    const { passwort, ...data } = req.body;
    await m.update(data);
    if (passwort && passwort.length >= 6) await m.update({ passwort });
    logAktion(`Mitarbeiter aktualisiert: ${m.vorname} ${m.nachname}`, 'Mitarbeiter', req.mitarbeiter, {});
    res.json({ ...m.toJSON(), passwort: undefined });
  } catch (error) {
    res.status(500).json({ error: 'Serverfehler.' });
  }
});

router.patch('/:id/status', authenticate, requirePermission('mitarbeiter.verwalten'), async (req, res) => {
  try {
    const m = await Mitarbeiter.findByPk(req.params.id);
    if (!m) return res.status(404).json({ error: 'Nicht gefunden.' });
    if (m.id === req.mitarbeiter.id) return res.status(400).json({ error: 'Eigenen Account nicht deaktivieren.' });
    await m.update({ aktiv: req.body.aktiv });
    res.json({ message: 'Status aktualisiert.' });
  } catch (error) {
    res.status(500).json({ error: 'Serverfehler.' });
  }
});

module.exports = router;
