const express = require('express');
const { Op } = require('sequelize');
const { Bestellung, BestellungItem, MenuItem, Mitarbeiter } = require('../models');
const { authenticate, requirePermission } = require('../middleware/auth');
const { logAktion } = require('../utils/logger');

const router = express.Router();

const generateBestellnummer = () => {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(Math.random() * 9000 + 1000);
  return `BS-${date}-${rand}`;
};

// GET /api/bestellungen
router.get('/', authenticate, requirePermission('bestellungen.ansehen'), async (req, res) => {
  try {
    const { status, datum } = req.query;
    const where = {};
    if (status) where.status = status;
    if (datum) {
      const d = new Date(datum);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      where.erstellt_am = { [Op.between]: [d, next] };
    }

    const bestellungen = await Bestellung.findAll({
      where,
      include: [
        { model: Mitarbeiter, as: 'mitarbeiter', attributes: ['id', 'vorname', 'nachname'] },
        { model: BestellungItem, as: 'items', include: [{ model: MenuItem, as: 'menu_item', attributes: ['id', 'name', 'preis'] }] }
      ],
      order: [['erstellt_am', 'DESC']]
    });
    res.json(bestellungen);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Serverfehler.' });
  }
});

// GET /api/bestellungen/:id
router.get('/:id', authenticate, requirePermission('bestellungen.ansehen'), async (req, res) => {
  try {
    const b = await Bestellung.findByPk(req.params.id, {
      include: [
        { model: Mitarbeiter, as: 'mitarbeiter', attributes: ['id', 'vorname', 'nachname'] },
        { model: BestellungItem, as: 'items', include: [{ model: MenuItem, as: 'menu_item' }] }
      ]
    });
    if (!b) return res.status(404).json({ error: 'Nicht gefunden.' });
    res.json(b);
  } catch (error) {
    res.status(500).json({ error: 'Serverfehler.' });
  }
});

// POST /api/bestellungen
router.post('/', authenticate, requirePermission('bestellungen.verwalten'), async (req, res) => {
  try {
    const { items, notiz, tisch_nr } = req.body;
    if (!items || items.length === 0) return res.status(400).json({ error: 'Keine Items in der Bestellung.' });

    let gesamtbetrag = 0;
    const itemDetails = [];
    for (const item of items) {
      const menuItem = await MenuItem.findByPk(item.menu_item_id);
      if (!menuItem) return res.status(404).json({ error: `Menü-Item ${item.menu_item_id} nicht gefunden.` });
      const preis = parseFloat(menuItem.preis);
      gesamtbetrag += preis * item.menge;
      itemDetails.push({ menu_item_id: item.menu_item_id, menge: item.menge, preis_einzeln: preis, notiz: item.notiz || null });
    }

    const bestellung = await Bestellung.create({
      bestellnummer: generateBestellnummer(),
      status: 'offen',
      gesamtbetrag: gesamtbetrag.toFixed(2),
      notiz,
      tisch_nr,
      mitarbeiter_id: req.mitarbeiter.id
    });

    await BestellungItem.bulkCreate(itemDetails.map(i => ({ ...i, bestellung_id: bestellung.id })));
    logAktion(`Bestellung erstellt: ${bestellung.bestellnummer}`, 'Bestellungen', req.mitarbeiter, { bestellung_id: bestellung.id });

    const full = await Bestellung.findByPk(bestellung.id, {
      include: [{ model: BestellungItem, as: 'items', include: [{ model: MenuItem, as: 'menu_item' }] }]
    });
    res.status(201).json(full);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Fehler beim Erstellen der Bestellung.' });
  }
});

// PATCH /api/bestellungen/:id/status
router.patch('/:id/status', authenticate, requirePermission('bestellungen.verwalten'), async (req, res) => {
  try {
    const { status } = req.body;
    const b = await Bestellung.findByPk(req.params.id);
    if (!b) return res.status(404).json({ error: 'Nicht gefunden.' });
    await b.update({ status });
    logAktion(`Bestellstatus geändert: ${b.bestellnummer} → ${status}`, 'Bestellungen', req.mitarbeiter, { bestellung_id: b.id });
    res.json(b);
  } catch (error) {
    res.status(500).json({ error: 'Serverfehler.' });
  }
});

module.exports = router;
