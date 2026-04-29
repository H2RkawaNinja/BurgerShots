const express = require('express');
const { HygienePruefung, HygieneEintrag, HygieneCheckpunkt, Mitarbeiter } = require('../models');
const { authenticate, requirePermission } = require('../middleware/auth');
const { logAktion } = require('../utils/logger');

const router = express.Router();

// ─── Prüfungen ────────────────────────────────────────────────────────────────

// GET /api/hygiene/pruefungen — Liste aller Prüfungen
router.get('/pruefungen', authenticate, requirePermission('hygiene.ansehen'), async (req, res) => {
  try {
    const pruefungen = await HygienePruefung.findAll({
      include: [
        { model: Mitarbeiter, as: 'mitarbeiter', attributes: ['id', 'vorname', 'nachname'] },
        { model: HygieneEintrag, as: 'eintraege', attributes: ['id', 'erledigt'] }
      ],
      order: [['datum', 'DESC'], ['erstellt_am', 'DESC']]
    });

    const result = pruefungen.map(p => {
      const data = p.toJSON();
      data.eintraege_gesamt = data.eintraege.length;
      data.eintraege_erledigt = data.eintraege.filter(e => e.erledigt).length;
      delete data.eintraege;
      return data;
    });

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Serverfehler.' });
  }
});

// POST /api/hygiene/pruefungen — Neue Prüfung erstellen
router.post('/pruefungen', authenticate, requirePermission('hygiene.verwalten'), async (req, res) => {
  try {
    const { typ, datum, notiz } = req.body;

    const pruefung = await HygienePruefung.create({
      typ: typ || 'taeglich',
      datum: datum || new Date(),
      mitarbeiter_id: req.mitarbeiter.id,
      notiz: notiz || null
    });

    // Aktive Checkpunkte als Einträge kopieren
    const checkpunkte = await HygieneCheckpunkt.findAll({
      where: { aktiv: true },
      order: [['reihenfolge', 'ASC']]
    });

    if (checkpunkte.length > 0) {
      await HygieneEintrag.bulkCreate(
        checkpunkte.map(cp => ({
          pruefung_id: pruefung.id,
          checkpoint_id: cp.id,
          bezeichnung: cp.bezeichnung,
          bereich: cp.bereich,
          erledigt: false
        }))
      );
    }

    logAktion(`Hygiene-Prüfung erstellt: ${typ} vom ${datum}`, 'Hygiene', req.mitarbeiter, {});
    res.status(201).json(pruefung);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Serverfehler.' });
  }
});

// GET /api/hygiene/pruefungen/:id — Einzelne Prüfung mit Einträgen
router.get('/pruefungen/:id', authenticate, requirePermission('hygiene.ansehen'), async (req, res) => {
  try {
    const pruefung = await HygienePruefung.findByPk(req.params.id, {
      include: [
        { model: Mitarbeiter, as: 'mitarbeiter', attributes: ['id', 'vorname', 'nachname'] },
        { model: HygieneEintrag, as: 'eintraege', order: [['bereich', 'ASC']] }
      ]
    });
    if (!pruefung) return res.status(404).json({ error: 'Nicht gefunden.' });
    res.json(pruefung);
  } catch (error) {
    res.status(500).json({ error: 'Serverfehler.' });
  }
});

// PUT /api/hygiene/pruefungen/:id/abschliessen — Prüfung abschliessen
router.put('/pruefungen/:id/abschliessen', authenticate, requirePermission('hygiene.verwalten'), async (req, res) => {
  try {
    const pruefung = await HygienePruefung.findByPk(req.params.id);
    if (!pruefung) return res.status(404).json({ error: 'Nicht gefunden.' });
    await pruefung.update({ abgeschlossen: true, abgeschlossen_am: new Date(), notiz: req.body.notiz ?? pruefung.notiz });
    logAktion(`Hygiene-Prüfung abgeschlossen: #${pruefung.id}`, 'Hygiene', req.mitarbeiter, {});
    res.json(pruefung);
  } catch (error) {
    res.status(500).json({ error: 'Serverfehler.' });
  }
});

// DELETE /api/hygiene/pruefungen/:id
router.delete('/pruefungen/:id', authenticate, requirePermission('hygiene.verwalten'), async (req, res) => {
  try {
    const pruefung = await HygienePruefung.findByPk(req.params.id);
    if (!pruefung) return res.status(404).json({ error: 'Nicht gefunden.' });
    await HygieneEintrag.destroy({ where: { pruefung_id: pruefung.id } });
    await pruefung.destroy();
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: 'Serverfehler.' });
  }
});

// ─── Einträge ─────────────────────────────────────────────────────────────────

// PUT /api/hygiene/eintraege/:id — Eintrag aktualisieren (erledigt / bemerkung)
router.put('/eintraege/:id', authenticate, requirePermission('hygiene.verwalten'), async (req, res) => {
  try {
    const eintrag = await HygieneEintrag.findByPk(req.params.id);
    if (!eintrag) return res.status(404).json({ error: 'Nicht gefunden.' });
    const { erledigt, bemerkung } = req.body;
    await eintrag.update({
      erledigt: erledigt !== undefined ? erledigt : eintrag.erledigt,
      bemerkung: bemerkung !== undefined ? bemerkung : eintrag.bemerkung
    });
    res.json(eintrag);
  } catch (error) {
    res.status(500).json({ error: 'Serverfehler.' });
  }
});

// ─── Checkpunkte ──────────────────────────────────────────────────────────────

// GET /api/hygiene/checkpunkte
router.get('/checkpunkte', authenticate, requirePermission('hygiene.ansehen'), async (req, res) => {
  try {
    const checkpunkte = await HygieneCheckpunkt.findAll({ order: [['bereich', 'ASC'], ['reihenfolge', 'ASC']] });
    res.json(checkpunkte);
  } catch (error) {
    res.status(500).json({ error: 'Serverfehler.' });
  }
});

// POST /api/hygiene/checkpunkte
router.post('/checkpunkte', authenticate, requirePermission('hygiene.verwalten'), async (req, res) => {
  try {
    const { bezeichnung, bereich, reihenfolge } = req.body;
    if (!bezeichnung || !bereich) return res.status(400).json({ error: 'Bezeichnung und Bereich sind Pflicht.' });
    const cp = await HygieneCheckpunkt.create({ bezeichnung, bereich, reihenfolge: reihenfolge || 0 });
    res.status(201).json(cp);
  } catch (error) {
    res.status(500).json({ error: 'Serverfehler.' });
  }
});

// PUT /api/hygiene/checkpunkte/:id
router.put('/checkpunkte/:id', authenticate, requirePermission('hygiene.verwalten'), async (req, res) => {
  try {
    const cp = await HygieneCheckpunkt.findByPk(req.params.id);
    if (!cp) return res.status(404).json({ error: 'Nicht gefunden.' });
    await cp.update(req.body);
    res.json(cp);
  } catch (error) {
    res.status(500).json({ error: 'Serverfehler.' });
  }
});

// DELETE /api/hygiene/checkpunkte/:id
router.delete('/checkpunkte/:id', authenticate, requirePermission('hygiene.verwalten'), async (req, res) => {
  try {
    const cp = await HygieneCheckpunkt.findByPk(req.params.id);
    if (!cp) return res.status(404).json({ error: 'Nicht gefunden.' });
    await cp.destroy();
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: 'Serverfehler.' });
  }
});

module.exports = router;
