const express = require('express');
const { Rolle, Recht, Mitarbeiter } = require('../models');
const { authenticate, requirePermission } = require('../middleware/auth');
const { logAktion } = require('../utils/logger');

const router = express.Router();

router.get('/', authenticate, requirePermission('rollen.verwalten'), async (req, res) => {
  try {
    const rollen = await Rolle.findAll({
      include: [{ model: Recht, as: 'rechte' }],
      order: [['name', 'ASC']]
    });
    res.json(rollen);
  } catch (error) {
    res.status(500).json({ error: 'Serverfehler.' });
  }
});

router.post('/', authenticate, requirePermission('rollen.verwalten'), async (req, res) => {
  try {
    const { name, farbe, beschreibung, rechte_ids } = req.body;
    const rolle = await Rolle.create({ name, farbe, beschreibung });
    if (rechte_ids?.length) {
      const rechte = await Recht.findAll({ where: { id: rechte_ids } });
      await rolle.setRechte(rechte);
    }
    logAktion(`Rolle erstellt: ${rolle.name}`, 'Rollen', req.mitarbeiter, {});
    const full = await Rolle.findByPk(rolle.id, { include: [{ model: Recht, as: 'rechte' }] });
    res.status(201).json(full);
  } catch (error) {
    res.status(500).json({ error: 'Serverfehler.' });
  }
});

router.put('/:id', authenticate, requirePermission('rollen.verwalten'), async (req, res) => {
  try {
    const rolle = await Rolle.findByPk(req.params.id);
    if (!rolle) return res.status(404).json({ error: 'Nicht gefunden.' });
    const { rechte_ids, ...data } = req.body;
    await rolle.update(data);
    if (rechte_ids !== undefined) {
      const rechte = await Recht.findAll({ where: { id: rechte_ids } });
      await rolle.setRechte(rechte);
    }
    const full = await Rolle.findByPk(rolle.id, { include: [{ model: Recht, as: 'rechte' }] });
    res.json(full);
  } catch (error) {
    res.status(500).json({ error: 'Serverfehler.' });
  }
});

router.delete('/:id', authenticate, requirePermission('rollen.verwalten'), async (req, res) => {
  try {
    const rolle = await Rolle.findByPk(req.params.id);
    if (!rolle) return res.status(404).json({ error: 'Nicht gefunden.' });
    const inUse = await Mitarbeiter.count({ where: { rollen_id: req.params.id } });
    if (inUse > 0) return res.status(409).json({ error: 'Rolle wird noch von Mitarbeitern verwendet.' });
    await rolle.destroy();
    res.json({ message: 'Gelöscht.' });
  } catch (error) {
    res.status(500).json({ error: 'Serverfehler.' });
  }
});

module.exports = router;
