const express = require('express');
const { AktivitaetsLog } = require('../models');
const { authenticate, requirePermission } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, requirePermission('log.ansehen'), async (req, res) => {
  try {
    const { limit = 100, offset = 0, kategorie } = req.query;
    const where = {};
    if (kategorie) where.kategorie = kategorie;

    const { count, rows } = await AktivitaetsLog.findAndCountAll({
      where,
      order: [['erstellt_am', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    res.json({ total: count, eintraege: rows });
  } catch (error) {
    res.status(500).json({ error: 'Serverfehler.' });
  }
});

router.get('/meine', authenticate, async (req, res) => {
  try {
    const eintraege = await AktivitaetsLog.findAll({
      where: { mitarbeiter_id: req.mitarbeiter.id },
      order: [['erstellt_am', 'DESC']],
      limit: 50
    });
    res.json(eintraege);
  } catch (error) {
    res.status(500).json({ error: 'Serverfehler.' });
  }
});

module.exports = router;
