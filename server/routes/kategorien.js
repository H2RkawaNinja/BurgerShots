const express = require('express');
const { Kategorie } = require('../models');
const { authenticate, requirePermission } = require('../middleware/auth');
const { logAktion } = require('../utils/logger');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const kategorien = await Kategorie.findAll({ order: [['reihenfolge', 'ASC']] });
    res.json(kategorien);
  } catch (error) {
    res.status(500).json({ error: 'Serverfehler.' });
  }
});

router.post('/', authenticate, requirePermission('speisekarte.erstellen'), async (req, res) => {
  try {
    const kat = await Kategorie.create(req.body);
    logAktion(`Kategorie erstellt: ${kat.name}`, 'Speisekarte', req.mitarbeiter, {});
    res.status(201).json(kat);
  } catch (error) {
    res.status(500).json({ error: 'Serverfehler.' });
  }
});

router.put('/:id', authenticate, requirePermission('speisekarte.bearbeiten'), async (req, res) => {
  try {
    const kat = await Kategorie.findByPk(req.params.id);
    if (!kat) return res.status(404).json({ error: 'Nicht gefunden.' });
    await kat.update(req.body);
    res.json(kat);
  } catch (error) {
    res.status(500).json({ error: 'Serverfehler.' });
  }
});

router.delete('/:id', authenticate, requirePermission('speisekarte.loeschen'), async (req, res) => {
  try {
    const kat = await Kategorie.findByPk(req.params.id);
    if (!kat) return res.status(404).json({ error: 'Nicht gefunden.' });
    await kat.destroy();
    res.json({ message: 'Gelöscht.' });
  } catch (error) {
    res.status(500).json({ error: 'Serverfehler.' });
  }
});

module.exports = router;
