const express = require('express');
const { Zutat, Lagerbestand, Mitarbeiter } = require('../models');
const { authenticate, requirePermission } = require('../middleware/auth');
const { logAktion } = require('../utils/logger');

const router = express.Router();

// GET /api/lagerbestand - Alle Zutaten mit aktuellem Bestand
router.get('/', authenticate, requirePermission('lagerbestand.ansehen'), async (req, res) => {
  try {
    const zutaten = await Zutat.findAll({
      where: { aktiv: true },
      include: [{
        model: Lagerbestand,
        as: 'lagerbestand',
        include: [{ model: Mitarbeiter, as: 'aktualisierer', attributes: ['id', 'vorname', 'nachname'] }]
      }],
      order: [['kategorie', 'ASC'], ['name', 'ASC']]
    });
    res.json(zutaten);
  } catch (error) {
    res.status(500).json({ error: 'Serverfehler.' });
  }
});

// POST /api/lagerbestand/zutaten - Neue Zutat
router.post('/zutaten', authenticate, requirePermission('lagerbestand.verwalten'), async (req, res) => {
  try {
    const zutat = await Zutat.create(req.body);
    await Lagerbestand.create({ zutat_id: zutat.id, menge_aktuell: 0 });
    logAktion(`Zutat erstellt: ${zutat.name}`, 'Lagerbestand', req.mitarbeiter, {});
    res.status(201).json(zutat);
  } catch (error) {
    res.status(500).json({ error: 'Serverfehler.' });
  }
});

// PUT /api/lagerbestand/:zutat_id - Bestand aktualisieren
router.put('/:zutat_id', authenticate, requirePermission('lagerbestand.verwalten'), async (req, res) => {
  try {
    const { menge_aktuell, notiz } = req.body;
    let lb = await Lagerbestand.findOne({ where: { zutat_id: req.params.zutat_id } });
    if (!lb) {
      lb = await Lagerbestand.create({ zutat_id: req.params.zutat_id, menge_aktuell: 0 });
    }
    await lb.update({
      menge_aktuell,
      notiz,
      letzte_aktualisierung: new Date(),
      aktualisiert_von: req.mitarbeiter.id
    });
    const zutat = await Zutat.findByPk(req.params.zutat_id);
    logAktion(`Bestand aktualisiert: ${zutat?.name} → ${menge_aktuell}`, 'Lagerbestand', req.mitarbeiter, {});
    res.json(lb);
  } catch (error) {
    res.status(500).json({ error: 'Serverfehler.' });
  }
});

// PUT /api/lagerbestand/zutaten/:id - Zutat bearbeiten
router.put('/zutaten/:id', authenticate, requirePermission('lagerbestand.verwalten'), async (req, res) => {
  try {
    const zutat = await Zutat.findByPk(req.params.id);
    if (!zutat) return res.status(404).json({ error: 'Nicht gefunden.' });
    await zutat.update(req.body);
    res.json(zutat);
  } catch (error) {
    res.status(500).json({ error: 'Serverfehler.' });
  }
});

module.exports = router;
