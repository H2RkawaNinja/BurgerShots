const express = require('express');
const { Recht } = require('../models');
const { authenticate, requirePermission } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, requirePermission('rollen.verwalten'), async (req, res) => {
  try {
    const rechte = await Recht.findAll({ order: [['kategorie', 'ASC'], ['name', 'ASC']] });
    res.json(rechte);
  } catch (error) {
    res.status(500).json({ error: 'Serverfehler.' });
  }
});

module.exports = router;
