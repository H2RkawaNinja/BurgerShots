const express = require('express');
const { Op, fn, col, literal } = require('sequelize');
const { Bestellung, BestellungItem, MenuItem, Kategorie, Mitarbeiter } = require('../models');
const { authenticate, requirePermission } = require('../middleware/auth');

const router = express.Router();

const getDateRange = (zeitraum) => {
  const now = new Date();
  const from = new Date();
  if (zeitraum === '7d') from.setDate(now.getDate() - 7);
  else if (zeitraum === '30d') from.setDate(now.getDate() - 30);
  else if (zeitraum === '3m') from.setMonth(now.getMonth() - 3);
  else if (zeitraum === '12m') from.setFullYear(now.getFullYear() - 1);
  else from.setFullYear(2000);
  return { [Op.gte]: from };
};

// GET /api/stats - Dashboard KPIs
router.get('/', authenticate, requirePermission('dashboard.stats'), async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      bestellungenHeute,
      umsatzHeute,
      umsatzMonat,
      offeneBestellungen,
      menuItemsGesamt,
      teamGesamt
    ] = await Promise.all([
      Bestellung.count({ where: { erstellt_am: { [Op.between]: [today, tomorrow] }, status: { [Op.ne]: 'storniert' } } }),
      Bestellung.sum('gesamtbetrag', { where: { erstellt_am: { [Op.between]: [today, tomorrow] }, status: { [Op.ne]: 'storniert' } } }),
      Bestellung.sum('gesamtbetrag', { where: { erstellt_am: { [Op.gte]: monthStart }, status: { [Op.ne]: 'storniert' } } }),
      Bestellung.count({ where: { status: { [Op.in]: ['offen', 'zubereitung'] } } }),
      MenuItem.count({ where: { verfuegbar: true } }),
      Mitarbeiter.count({ where: { aktiv: true } })
    ]);

    res.json({
      bestellungenHeute: bestellungenHeute || 0,
      umsatzHeute: parseFloat(umsatzHeute || 0).toFixed(2),
      umsatzMonat: parseFloat(umsatzMonat || 0).toFixed(2),
      offeneBestellungen: offeneBestellungen || 0,
      menuItemsGesamt: menuItemsGesamt || 0,
      teamGesamt: teamGesamt || 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Serverfehler.' });
  }
});

// GET /api/stats/umsatz?zeitraum=30d
router.get('/umsatz', authenticate, requirePermission('statistiken.ansehen'), async (req, res) => {
  try {
    const { zeitraum = '30d' } = req.query;
    const bestellungen = await Bestellung.findAll({
      where: { erstellt_am: getDateRange(zeitraum), status: { [Op.ne]: 'storniert' } },
      attributes: [
        [fn('DATE', col('erstellt_am')), 'datum'],
        [fn('SUM', col('gesamtbetrag')), 'umsatz'],
        [fn('COUNT', col('id')), 'anzahl']
      ],
      group: [fn('DATE', col('erstellt_am'))],
      order: [[fn('DATE', col('erstellt_am')), 'ASC']]
    });
    res.json(bestellungen);
  } catch (error) {
    res.status(500).json({ error: 'Serverfehler.' });
  }
});

// GET /api/stats/top-items?zeitraum=30d
router.get('/top-items', authenticate, requirePermission('statistiken.ansehen'), async (req, res) => {
  try {
    const { zeitraum = '30d' } = req.query;
    const items = await BestellungItem.findAll({
      include: [{
        model: Bestellung, as: 'bestellung',
        where: { erstellt_am: getDateRange(zeitraum), status: { [Op.ne]: 'storniert' } },
        attributes: []
      }, {
        model: MenuItem, as: 'menu_item', attributes: ['id', 'name']
      }],
      attributes: [
        'menu_item_id',
        [fn('SUM', col('menge')), 'verkauft'],
        [fn('SUM', literal('menge * preis_einzeln')), 'umsatz']
      ],
      group: ['menu_item_id', 'menu_item.id', 'menu_item.name'],
      order: [[fn('SUM', col('menge')), 'DESC']],
      limit: 10
    });
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Serverfehler.' });
  }
});

// GET /api/stats/kategorien
router.get('/kategorien', authenticate, requirePermission('statistiken.ansehen'), async (req, res) => {
  try {
    const kategorien = await Kategorie.findAll({
      include: [{ model: MenuItem, as: 'menu_items', attributes: ['id', 'verfuegbar'] }]
    });
    const result = kategorien.map(k => ({
      id: k.id,
      name: k.name,
      icon: k.icon,
      gesamt: k.menu_items.length,
      verfuegbar: k.menu_items.filter(i => i.verfuegbar).length
    }));
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Serverfehler.' });
  }
});

// GET /api/stats/mitarbeiter?zeitraum=30d
router.get('/mitarbeiter', authenticate, requirePermission('statistiken.ansehen'), async (req, res) => {
  try {
    const { zeitraum = '30d' } = req.query;
    const mitarbeiter = await Mitarbeiter.findAll({
      where: { aktiv: true },
      include: [{
        model: Bestellung, as: 'bestellungen',
        where: { erstellt_am: getDateRange(zeitraum), status: { [Op.ne]: 'storniert' } },
        required: false,
        attributes: []
      }],
      attributes: [
        'id', 'vorname', 'nachname',
        [fn('COUNT', col('bestellungen.id')), 'bestellungen_anzahl'],
        [fn('SUM', col('bestellungen.gesamtbetrag')), 'umsatz']
      ],
      group: ['Mitarbeiter.id'],
      order: [[fn('COUNT', col('bestellungen.id')), 'DESC']]
    });
    res.json(mitarbeiter);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Serverfehler.' });
  }
});

module.exports = router;
