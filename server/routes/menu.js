const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Op } = require('sequelize');
const { MenuItem, Kategorie, Mitarbeiter } = require('../models');
const { authenticate, requirePermission } = require('../middleware/auth');
const { logAktion } = require('../utils/logger');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/menu');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `menu-${Date.now()}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Nur Bilder erlaubt'));
  }
});

// GET /api/menu - public
router.get('/', async (req, res) => {
  try {
    const { kategorie, verfuegbar, featured, search } = req.query;
    const where = {};
    if (kategorie) where.kategorie_id = kategorie;
    if (verfuegbar !== undefined) where.verfuegbar = verfuegbar === 'true';
    if (featured === 'true') where.featured = true;
    if (search) where.name = { [Op.like]: `%${search}%` };

    const items = await MenuItem.findAll({
      where,
      include: [{ model: Kategorie, as: 'kategorie' }],
      order: [['kategorie_id', 'ASC'], ['name', 'ASC']]
    });
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Fehler beim Laden der Speisekarte.' });
  }
});

// GET /api/menu/:id
router.get('/:id', async (req, res) => {
  try {
    const item = await MenuItem.findByPk(req.params.id, {
      include: [{ model: Kategorie, as: 'kategorie' }]
    });
    if (!item) return res.status(404).json({ error: 'Nicht gefunden.' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Serverfehler.' });
  }
});

// POST /api/menu
router.post('/', authenticate, requirePermission('speisekarte.erstellen'), upload.single('bild'), async (req, res) => {
  try {
    const data = { ...req.body, erstellt_von: req.mitarbeiter.id };
    if (req.file) data.bild = `/uploads/menu/${req.file.filename}`;
    const item = await MenuItem.create(data);
    logAktion(`Menü-Item erstellt: ${item.name}`, 'Speisekarte', req.mitarbeiter, { item_id: item.id });
    res.status(201).json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Fehler beim Erstellen.' });
  }
});

// PUT /api/menu/:id
router.put('/:id', authenticate, requirePermission('speisekarte.bearbeiten'), upload.single('bild'), async (req, res) => {
  try {
    const item = await MenuItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Nicht gefunden.' });

    const data = { ...req.body, aktualisiert_von: req.mitarbeiter.id };
    if (req.file) data.bild = `/uploads/menu/${req.file.filename}`;
    await item.update(data);
    logAktion(`Menü-Item aktualisiert: ${item.name}`, 'Speisekarte', req.mitarbeiter, { item_id: item.id });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Fehler beim Aktualisieren.' });
  }
});

// DELETE /api/menu/:id
router.delete('/:id', authenticate, requirePermission('speisekarte.loeschen'), async (req, res) => {
  try {
    const item = await MenuItem.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Nicht gefunden.' });
    logAktion(`Menü-Item gelöscht: ${item.name}`, 'Speisekarte', req.mitarbeiter, { item_id: item.id });
    await item.destroy();
    res.json({ message: 'Gelöscht.' });
  } catch (error) {
    res.status(500).json({ error: 'Fehler beim Löschen.' });
  }
});

module.exports = router;
