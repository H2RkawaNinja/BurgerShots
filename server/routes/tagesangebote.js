const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Tagesangebot, MenuItem } = require('../models');
const { authenticate, requirePermission } = require('../middleware/auth');
const { logAktion } = require('../utils/logger');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/angebote');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, `angebot-${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.get('/', async (req, res) => {
  try {
    const where = {};
    if (req.query.aktiv === 'true') where.aktiv = true;
    const angebote = await Tagesangebot.findAll({
      where,
      include: [{ model: MenuItem, as: 'menu_item', attributes: ['id', 'name', 'preis'] }],
      order: [['erstellt_am', 'DESC']]
    });
    res.json(angebote);
  } catch (error) {
    res.status(500).json({ error: 'Serverfehler.' });
  }
});

router.post('/', authenticate, requirePermission('tagesangebote.verwalten'), upload.single('bild'), async (req, res) => {
  try {
    const data = { ...req.body, erstellt_von: req.mitarbeiter.id };
    if (req.file) data.bild = `/uploads/angebote/${req.file.filename}`;
    const angebot = await Tagesangebot.create(data);
    logAktion(`Tagesangebot erstellt: ${angebot.name}`, 'Tagesangebote', req.mitarbeiter, { angebot_id: angebot.id });
    res.status(201).json(angebot);
  } catch (error) {
    res.status(500).json({ error: 'Serverfehler.' });
  }
});

router.put('/:id', authenticate, requirePermission('tagesangebote.verwalten'), upload.single('bild'), async (req, res) => {
  try {
    const a = await Tagesangebot.findByPk(req.params.id);
    if (!a) return res.status(404).json({ error: 'Nicht gefunden.' });
    const data = { ...req.body };
    if (req.file) data.bild = `/uploads/angebote/${req.file.filename}`;
    await a.update(data);
    res.json(a);
  } catch (error) {
    res.status(500).json({ error: 'Serverfehler.' });
  }
});

router.delete('/:id', authenticate, requirePermission('tagesangebote.verwalten'), async (req, res) => {
  try {
    const a = await Tagesangebot.findByPk(req.params.id);
    if (!a) return res.status(404).json({ error: 'Nicht gefunden.' });
    logAktion(`Tagesangebot gelöscht: ${a.name}`, 'Tagesangebote', req.mitarbeiter, {});
    await a.destroy();
    res.json({ message: 'Gelöscht.' });
  } catch (error) {
    res.status(500).json({ error: 'Serverfehler.' });
  }
});

module.exports = router;
