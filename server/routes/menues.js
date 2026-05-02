const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Menue, MenueItem, MenuItem, Kategorie } = require('../models');
const { authenticate, requirePermission } = require('../middleware/auth');
const { logAktion } = require('../utils/logger');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/menues');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `menue-${Date.now()}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Nur Bilder erlaubt'));
  }
});

const itemInclude = [
  {
    model: MenueItem,
    as: 'menue_items',
    include: [{ model: MenuItem, as: 'menu_item', include: [{ model: Kategorie, as: 'kategorie' }] }]
  }
];

// GET /api/menues
router.get('/', async (req, res) => {
  try {
    const menues = await Menue.findAll({ include: itemInclude, order: [['name', 'ASC']] });
    res.json(menues);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Fehler beim Laden der Menüs.' });
  }
});

// GET /api/menues/:id
router.get('/:id', async (req, res) => {
  try {
    const menue = await Menue.findByPk(req.params.id, { include: itemInclude });
    if (!menue) return res.status(404).json({ error: 'Nicht gefunden.' });
    res.json(menue);
  } catch (error) {
    res.status(500).json({ error: 'Serverfehler.' });
  }
});

// POST /api/menues
router.post('/', authenticate, requirePermission('speisekarte.erstellen'), upload.single('bild'), async (req, res) => {
  try {
    const { items: itemsJson, ...body } = req.body;
    const data = {
      name: body.name,
      beschreibung: body.beschreibung || null,
      preis: parseFloat(body.preis),
      verfuegbar: body.verfuegbar === 'true' || body.verfuegbar === true,
      erstellt_von: req.mitarbeiter.id
    };
    if (req.file) data.bild = `/uploads/menues/${req.file.filename}`;

    const menue = await Menue.create(data);

    if (itemsJson) {
      const items = JSON.parse(itemsJson);
      for (const item of items) {
        await MenueItem.create({ menue_id: menue.id, menu_item_id: item.menu_item_id, menge: item.menge || 1 });
      }
    }

    logAktion(`Menü erstellt: ${menue.name}`, 'Speisekarte', req.mitarbeiter, { menue_id: menue.id });
    const full = await Menue.findByPk(menue.id, { include: itemInclude });
    res.status(201).json(full);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Fehler beim Erstellen.' });
  }
});

// PUT /api/menues/:id
router.put('/:id', authenticate, requirePermission('speisekarte.bearbeiten'), upload.single('bild'), async (req, res) => {
  try {
    const menue = await Menue.findByPk(req.params.id);
    if (!menue) return res.status(404).json({ error: 'Nicht gefunden.' });

    const { items: itemsJson, ...body } = req.body;
    const data = {
      name: body.name,
      beschreibung: body.beschreibung || null,
      preis: parseFloat(body.preis),
      verfuegbar: body.verfuegbar === 'true' || body.verfuegbar === true,
    };
    if (req.file) data.bild = `/uploads/menues/${req.file.filename}`;

    await menue.update(data);

    if (itemsJson !== undefined) {
      await MenueItem.destroy({ where: { menue_id: menue.id } });
      const items = JSON.parse(itemsJson);
      for (const item of items) {
        await MenueItem.create({ menue_id: menue.id, menu_item_id: item.menu_item_id, menge: item.menge || 1 });
      }
    }

    logAktion(`Menü aktualisiert: ${menue.name}`, 'Speisekarte', req.mitarbeiter, { menue_id: menue.id });
    const full = await Menue.findByPk(menue.id, { include: itemInclude });
    res.json(full);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Fehler beim Aktualisieren.' });
  }
});

// DELETE /api/menues/:id
router.delete('/:id', authenticate, requirePermission('speisekarte.loeschen'), async (req, res) => {
  try {
    const menue = await Menue.findByPk(req.params.id);
    if (!menue) return res.status(404).json({ error: 'Nicht gefunden.' });
    await MenueItem.destroy({ where: { menue_id: menue.id } });
    await menue.destroy();
    logAktion(`Menü gelöscht: ${menue.name}`, 'Speisekarte', req.mitarbeiter, { menue_id: menue.id });
    res.json({ message: 'Gelöscht.' });
  } catch (error) {
    res.status(500).json({ error: 'Fehler beim Löschen.' });
  }
});

module.exports = router;
