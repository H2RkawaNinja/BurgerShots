import { useEffect, useState, useCallback } from 'react';
import { Plus, ClipboardCheck, CheckSquare, Square, Printer, Trash2, ChevronLeft, Settings, X, Check } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

// ─── Hilfsfunktionen ──────────────────────────────────────────────────────────

const TYP_LABEL = { taeglich: 'Täglich', woechentlich: 'Wöchentlich', monatlich: 'Monatlich', sonder: 'Sonderprüfung' };
const TYP_COLOR = { taeglich: 'badge-open', woechentlich: 'badge-preparing', monatlich: 'badge-available', sonder: 'badge-picked-up' };

const formatDatum = (d) => new Date(d).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });

const druckenAlsPDF = (pruefung) => {
  const bereiche = [...new Set(pruefung.eintraege.map(e => e.bereich))].sort();
  const win = window.open('', '_blank');
  const erledigtCount = pruefung.eintraege.filter(e => e.erledigt).length;
  const total = pruefung.eintraege.length;

  win.document.write(`<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8">
  <title>Hygiene-Prüfprotokoll – ${formatDatum(pruefung.datum)}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 11pt; color: #111; padding: 20mm 15mm; }
    h1 { font-size: 18pt; margin-bottom: 4px; }
    .meta { font-size: 10pt; color: #555; margin-bottom: 16px; border-bottom: 2px solid #C8171E; padding-bottom: 10px; }
    .meta span { margin-right: 20px; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 9pt; font-weight: bold; }
    .badge-ok { background: #dcfce7; color: #166534; }
    .badge-offen { background: #fef9c3; color: #854d0e; }
    .bereich { margin-bottom: 16px; }
    .bereich h2 { font-size: 12pt; font-weight: bold; background: #f3f4f6; padding: 5px 8px; border-left: 4px solid #C8171E; margin-bottom: 6px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #f9fafb; text-align: left; padding: 5px 8px; font-size: 9pt; border-bottom: 1px solid #ddd; }
    td { padding: 5px 8px; border-bottom: 1px solid #eee; font-size: 10pt; vertical-align: top; }
    .check-col { width: 28px; text-align: center; font-size: 14pt; }
    .ok { color: #16a34a; }
    .nok { color: #dc2626; }
    .summary { margin-top: 20px; padding: 10px; background: #f9fafb; border: 1px solid #ddd; }
    .sign { margin-top: 30px; display: flex; gap: 40px; }
    .sign-box { flex: 1; border-top: 1px solid #333; padding-top: 4px; font-size: 9pt; color: #555; }
    footer { margin-top: 20px; font-size: 8pt; color: #aaa; text-align: center; }
    @page { margin: 15mm; }
  </style></head><body>
  <h1>Hygiene-Prüfprotokoll</h1>
  <div class="meta">
    <span><strong>Datum:</strong> ${formatDatum(pruefung.datum)}</span>
    <span><strong>Art:</strong> ${TYP_LABEL[pruefung.typ] || pruefung.typ}</span>
    <span><strong>Durchgeführt von:</strong> ${pruefung.mitarbeiter ? pruefung.mitarbeiter.vorname + ' ' + pruefung.mitarbeiter.nachname : '—'}</span>
    <span><strong>Status:</strong> <span class="badge ${pruefung.abgeschlossen ? 'badge-ok' : 'badge-offen'}">${pruefung.abgeschlossen ? 'Abgeschlossen' : 'Offen'}</span></span>
    ${pruefung.abgeschlossen_am ? `<span><strong>Abgeschlossen am:</strong> ${new Date(pruefung.abgeschlossen_am).toLocaleString('de-DE')}</span>` : ''}
  </div>
  ${bereiche.map(bereich => {
    const items = pruefung.eintraege.filter(e => e.bereich === bereich);
    return `<div class="bereich">
      <h2>${bereich}</h2>
      <table>
        <thead><tr><th class="check-col">✓</th><th>Prüfpunkt</th><th>Bemerkung</th></tr></thead>
        <tbody>
          ${items.map(e => `<tr>
            <td class="check-col ${e.erledigt ? 'ok' : 'nok'}">${e.erledigt ? '✓' : '✗'}</td>
            <td>${e.bezeichnung}</td>
            <td style="color:#555">${e.bemerkung || ''}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
  }).join('')}
  <div class="summary">
    <strong>Ergebnis:</strong> ${erledigtCount} von ${total} Prüfpunkten erledigt
    ${pruefung.notiz ? `<br><strong>Notiz:</strong> ${pruefung.notiz}` : ''}
  </div>
  <div class="sign">
    <div class="sign-box">Unterschrift Mitarbeiter</div>
    <div class="sign-box">Unterschrift Betriebsleiter</div>
    <div class="sign-box">Datum / Stempel</div>
  </div>
  <footer>BurgerShot · Hygiene-Prüfprotokoll · Erstellt am ${new Date().toLocaleString('de-DE')}</footer>
  </body></html>`);
  win.document.close();
  win.focus();
  win.print();
};

// ─── Hauptkomponente ──────────────────────────────────────────────────────────

const Hygiene = () => {
  const { hasPermission } = useAuth();
  const [view, setView] = useState('list'); // 'list' | 'detail' | 'checkpunkte'
  const [pruefungen, setPruefungen] = useState([]);
  const [selected, setSelected] = useState(null); // HygienePruefung mit Einträgen
  const [checkpunkte, setCheckpunkte] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Neue Prüfung Modal
  const [neueModal, setNeueModal] = useState(false);
  const [neueForm, setNeueForm] = useState({ typ: 'taeglich', datum: new Date().toISOString().slice(0, 10), notiz: '' });

  // Checkpunkt-Modal
  const [cpModal, setCpModal] = useState(false);
  const [cpForm, setCpForm] = useState({ bezeichnung: '', bereich: 'Küche', reihenfolge: 0 });
  const [cpEdit, setCpEdit] = useState(null);

  // Lösch-Bestätigung
  const [deleteId, setDeleteId] = useState(null);

  const loadPruefungen = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/hygiene/pruefungen');
      setPruefungen(res.data);
    } catch { setError('Fehler beim Laden.'); }
    finally { setLoading(false); }
  }, []);

  const loadDetail = useCallback(async (id) => {
    try {
      const res = await api.get(`/hygiene/pruefungen/${id}`);
      setSelected(res.data);
    } catch { setError('Fehler beim Laden.'); }
  }, []);

  const loadCheckpunkte = useCallback(async () => {
    try {
      const res = await api.get('/hygiene/checkpunkte');
      setCheckpunkte(res.data);
    } catch { setError('Fehler beim Laden.'); }
  }, []);

  useEffect(() => { loadPruefungen(); }, [loadPruefungen]);

  const openDetail = async (id) => {
    await loadDetail(id);
    setView('detail');
  };

  const openCheckpunkte = async () => {
    await loadCheckpunkte();
    setView('checkpunkte');
  };

  // Neue Prüfung erstellen
  const handleNeue = async () => {
    setSaving(true); setError('');
    try {
      const res = await api.post('/hygiene/pruefungen', neueForm);
      setNeueModal(false);
      await loadPruefungen();
      await openDetail(res.data.id);
    } catch (e) { setError(e.response?.data?.error || 'Fehler.'); }
    finally { setSaving(false); }
  };

  // Eintrag toggeln (sofortiges Speichern)
  const toggleEintrag = async (eintragId, erledigt) => {
    if (!selected || selected.abgeschlossen) return;
    // Optimistic update
    setSelected(s => ({
      ...s,
      eintraege: s.eintraege.map(e => e.id === eintragId ? { ...e, erledigt } : e)
    }));
    try {
      await api.put(`/hygiene/eintraege/${eintragId}`, { erledigt });
    } catch { await loadDetail(selected.id); }
  };

  // Bemerkung speichern (on blur)
  const saveBemerkung = async (eintragId, bemerkung) => {
    if (!selected || selected.abgeschlossen) return;
    try {
      await api.put(`/hygiene/eintraege/${eintragId}`, { bemerkung });
      setSelected(s => ({
        ...s,
        eintraege: s.eintraege.map(e => e.id === eintragId ? { ...e, bemerkung } : e)
      }));
    } catch { /* silent */ }
  };

  // Prüfung abschliessen
  const abschliessen = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await api.put(`/hygiene/pruefungen/${selected.id}/abschliessen`, { notiz: selected.notiz });
      await loadDetail(selected.id);
      await loadPruefungen();
    } catch { setError('Fehler beim Abschliessen.'); }
    finally { setSaving(false); }
  };

  // Prüfung löschen
  const handleDelete = async (id) => {
    try {
      await api.delete(`/hygiene/pruefungen/${id}`);
      setDeleteId(null);
      if (view === 'detail') { setView('list'); setSelected(null); }
      await loadPruefungen();
    } catch { setError('Fehler beim Löschen.'); }
  };

  // Checkpunkt speichern
  const saveCheckpunkt = async () => {
    setSaving(true); setError('');
    try {
      if (cpEdit) {
        await api.put(`/hygiene/checkpunkte/${cpEdit.id}`, cpForm);
      } else {
        await api.post('/hygiene/checkpunkte', cpForm);
      }
      setCpModal(false); setCpEdit(null);
      await loadCheckpunkte();
    } catch (e) { setError(e.response?.data?.error || 'Fehler.'); }
    finally { setSaving(false); }
  };

  const deleteCheckpunkt = async (id) => {
    try {
      await api.delete(`/hygiene/checkpunkte/${id}`);
      await loadCheckpunkte();
    } catch { setError('Fehler beim Löschen.'); }
  };

  const BEREICHE = ['Küche', 'Lager', 'Sanitär', 'Allgemein'];

  // ─── Render: Detail-Ansicht ────────────────────────────────────────────────
  if (view === 'detail' && selected) {
    const bereiche = [...new Set(selected.eintraege.map(e => e.bereich))].sort();
    const erledigtCount = selected.eintraege.filter(e => e.erledigt).length;
    const total = selected.eintraege.length;
    const progress = total > 0 ? Math.round((erledigtCount / total) * 100) : 0;

    return (
      <div className="animate-fade-in">
        {/* Header */}
        <div className="page-header">
          <div className="flex items-center gap-3">
            <button onClick={() => { setView('list'); setSelected(null); }} className="p-2 text-dark-400 hover:text-white rounded transition-colors">
              <ChevronLeft size={20} />
            </button>
            <div>
              <h1 className="page-title">HYGIENE-PRÜFUNG</h1>
              <p className="page-subtitle">
                {formatDatum(selected.datum)} · {TYP_LABEL[selected.typ]}
                {selected.mitarbeiter && ` · ${selected.mitarbeiter.vorname} ${selected.mitarbeiter.nachname}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => druckenAlsPDF(selected)} className="btn-ghost flex items-center gap-2">
              <Printer size={16} /> Als PDF drucken
            </button>
            {hasPermission('hygiene.verwalten') && !selected.abgeschlossen && (
              <button onClick={abschliessen} disabled={saving} className="btn-burger flex items-center gap-2">
                <Check size={16} /> Prüfung abschliessen
              </button>
            )}
          </div>
        </div>

        {error && <div className="alert alert-error mb-4">{error}</div>}

        {/* Fortschritt */}
        <div className="burger-card mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-dark-300 text-sm">Fortschritt: {erledigtCount} / {total} Punkte erledigt</span>
            <div className="flex items-center gap-2">
              <span className={`badge ${selected.abgeschlossen ? 'badge-available' : 'badge-open'}`}>
                {selected.abgeschlossen ? '✓ Abgeschlossen' : 'Offen'}
              </span>
              <span className="text-white font-bold">{progress}%</span>
            </div>
          </div>
          <div className="w-full bg-dark-700 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, backgroundColor: progress === 100 ? '#22c55e' : '#C8171E' }}
            />
          </div>
          {selected.abgeschlossen && selected.abgeschlossen_am && (
            <p className="text-dark-400 text-xs mt-2">Abgeschlossen am: {new Date(selected.abgeschlossen_am).toLocaleString('de-DE')}</p>
          )}
        </div>

        {/* Checklist gruppiert nach Bereich */}
        {bereiche.map(bereich => {
          const items = selected.eintraege.filter(e => e.bereich === bereich);
          const bereichOk = items.every(e => e.erledigt);
          return (
            <div key={bereich} className="burger-card mb-4">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-dark-700">
                <h3 className="font-display text-lg tracking-wider text-white">{bereich.toUpperCase()}</h3>
                <span className={`badge ${bereichOk ? 'badge-available' : 'badge-open'}`}>
                  {items.filter(e => e.erledigt).length}/{items.length}
                </span>
              </div>
              <div className="space-y-1">
                {items.map(eintrag => (
                  <div key={eintrag.id} className={`flex items-start gap-3 p-2 rounded transition-colors ${eintrag.erledigt ? 'bg-green-500/5' : 'hover:bg-dark-700/50'}`}>
                    <button
                      onClick={() => toggleEintrag(eintrag.id, !eintrag.erledigt)}
                      disabled={selected.abgeschlossen}
                      className={`mt-0.5 flex-shrink-0 transition-colors ${selected.abgeschlossen ? 'opacity-50 cursor-default' : 'cursor-pointer hover:scale-110'}`}
                    >
                      {eintrag.erledigt
                        ? <CheckSquare size={20} className="text-green-400" />
                        : <Square size={20} className="text-dark-400" />
                      }
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${eintrag.erledigt ? 'text-dark-400 line-through' : 'text-white'}`}>
                        {eintrag.bezeichnung}
                      </p>
                      {(!selected.abgeschlossen || eintrag.bemerkung) && (
                        <input
                          type="text"
                          defaultValue={eintrag.bemerkung || ''}
                          onBlur={e => saveBemerkung(eintrag.id, e.target.value)}
                          disabled={selected.abgeschlossen}
                          placeholder="Bemerkung..."
                          className="mt-1 w-full bg-transparent border-0 border-b border-dark-700 text-dark-400 text-xs py-0.5 focus:outline-none focus:border-burger-500 disabled:opacity-50"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Notiz */}
        <div className="burger-card mb-4">
          <h3 className="font-display text-lg tracking-wider text-white mb-3">NOTIZ</h3>
          <textarea
            rows={3}
            defaultValue={selected.notiz || ''}
            onBlur={async e => {
              if (!selected.abgeschlossen) {
                try { await api.put(`/hygiene/pruefungen/${selected.id}/abschliessen`, { notiz: e.target.value }); }
                catch { /* silent */ }
              }
            }}
            disabled={selected.abgeschlossen}
            placeholder="Allgemeine Notiz zur Prüfung..."
            className="input-burger w-full disabled:opacity-50"
          />
        </div>

        {/* Gefährliche Aktionen */}
        {hasPermission('hygiene.verwalten') && (
          <div className="flex justify-end">
            <button onClick={() => setDeleteId(selected.id)} className="text-dark-500 hover:text-burger-400 text-sm flex items-center gap-1 transition-colors">
              <Trash2 size={14} /> Prüfung löschen
            </button>
          </div>
        )}

        {/* Lösch-Dialog */}
        {deleteId && (
          <div className="modal-overlay">
            <div className="modal-box max-w-sm">
              <div className="modal-body text-center">
                <Trash2 size={32} className="text-burger-500 mx-auto mb-3" />
                <p className="text-white font-medium mb-1">Prüfung löschen?</p>
                <p className="text-dark-400 text-sm">Alle Einträge werden unwiderruflich gelöscht.</p>
              </div>
              <div className="modal-footer justify-center">
                <button className="btn-ghost" onClick={() => setDeleteId(null)}>Abbrechen</button>
                <button className="btn-burger" onClick={() => handleDelete(deleteId)}>Löschen</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── Render: Checkpunkte verwalten ────────────────────────────────────────
  if (view === 'checkpunkte') {
    const bereiche = [...new Set(checkpunkte.map(c => c.bereich))].sort();
    return (
      <div className="animate-fade-in">
        <div className="page-header">
          <div className="flex items-center gap-3">
            <button onClick={() => setView('list')} className="p-2 text-dark-400 hover:text-white rounded transition-colors">
              <ChevronLeft size={20} />
            </button>
            <h1 className="page-title">CHECKPUNKTE VERWALTEN</h1>
          </div>
          {hasPermission('hygiene.verwalten') && (
            <button className="btn-burger flex items-center gap-2" onClick={() => { setCpForm({ bezeichnung: '', bereich: 'Küche', reihenfolge: 0 }); setCpEdit(null); setCpModal(true); }}>
              <Plus size={16} /> Hinzufügen
            </button>
          )}
        </div>

        {error && <div className="alert alert-error mb-4">{error}</div>}

        {bereiche.map(bereich => (
          <div key={bereich} className="burger-card mb-4">
            <h3 className="font-display text-lg tracking-wider text-white mb-3 pb-2 border-b border-dark-700">{bereich.toUpperCase()}</h3>
            <div className="space-y-2">
              {checkpunkte.filter(c => c.bereich === bereich).map(cp => (
                <div key={cp.id} className="flex items-center justify-between gap-3 p-2 rounded hover:bg-dark-700/50">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${cp.aktiv ? 'bg-green-400' : 'bg-dark-500'}`} />
                    <span className="text-white text-sm">{cp.bezeichnung}</span>
                  </div>
                  {hasPermission('hygiene.verwalten') && (
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => { setCpForm({ bezeichnung: cp.bezeichnung, bereich: cp.bereich, reihenfolge: cp.reihenfolge, aktiv: cp.aktiv }); setCpEdit(cp); setCpModal(true); }}
                        className="p-1.5 text-dark-400 hover:text-amber-400 rounded transition-colors text-xs">Bearbeiten</button>
                      <button onClick={() => deleteCheckpunkt(cp.id)} className="p-1.5 text-dark-400 hover:text-burger-400 rounded transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {checkpunkte.length === 0 && (
          <div className="burger-card text-center py-12 text-dark-400">Keine Checkpunkte vorhanden.</div>
        )}

        {/* Checkpunkt Modal */}
        {cpModal && (
          <div className="modal-overlay">
            <div className="modal-box">
              <div className="modal-header">
                <h2 className="font-display text-xl text-white tracking-wide">{cpEdit ? 'CHECKPUNKT BEARBEITEN' : 'CHECKPUNKT HINZUFÜGEN'}</h2>
                <button onClick={() => { setCpModal(false); setCpEdit(null); }} className="text-dark-400 hover:text-white"><X size={20} /></button>
              </div>
              <div className="modal-body space-y-3">
                {error && <div className="alert alert-error">{error}</div>}
                <div>
                  <label className="label-burger">Bezeichnung *</label>
                  <input className="input-burger" value={cpForm.bezeichnung} onChange={e => setCpForm(f => ({ ...f, bezeichnung: e.target.value }))} placeholder="z.B. Kühlschrank Temperatur geprüft" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label-burger">Bereich</label>
                    <select className="select-burger" value={cpForm.bereich} onChange={e => setCpForm(f => ({ ...f, bereich: e.target.value }))}>
                      {BEREICHE.map(b => <option key={b} value={b}>{b}</option>)}
                      <option value="Sonstiges">Sonstiges</option>
                    </select>
                  </div>
                  <div>
                    <label className="label-burger">Reihenfolge</label>
                    <input type="number" className="input-burger" value={cpForm.reihenfolge} onChange={e => setCpForm(f => ({ ...f, reihenfolge: parseInt(e.target.value) || 0 }))} />
                  </div>
                </div>
                {cpEdit && (
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="cpAktiv" checked={cpForm.aktiv !== false} onChange={e => setCpForm(f => ({ ...f, aktiv: e.target.checked }))} className="w-4 h-4 accent-burger-500" />
                    <label htmlFor="cpAktiv" className="label-burger mb-0">Aktiv (wird bei neuen Prüfungen verwendet)</label>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn-ghost" onClick={() => { setCpModal(false); setCpEdit(null); }}>Abbrechen</button>
                <button className="btn-burger" onClick={saveCheckpunkt} disabled={saving || !cpForm.bezeichnung}>{saving ? '...' : 'Speichern'}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── Render: Listenansicht ─────────────────────────────────────────────────
  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">HYGIENE</h1>
          <p className="page-subtitle">{pruefungen.filter(p => !p.abgeschlossen).length} offene Prüfungen</p>
        </div>
        <div className="flex gap-2">
          {hasPermission('hygiene.verwalten') && (
            <button className="btn-ghost flex items-center gap-2" onClick={openCheckpunkte}>
              <Settings size={16} /> Checkpunkte
            </button>
          )}
          {hasPermission('hygiene.verwalten') && (
            <button className="btn-burger flex items-center gap-2" onClick={() => { setNeueForm({ typ: 'taeglich', datum: new Date().toISOString().slice(0, 10), notiz: '' }); setNeueModal(true); }}>
              <Plus size={16} /> Neue Prüfung
            </button>
          )}
        </div>
      </div>

      {error && <div className="alert alert-error mb-4">{error}</div>}

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-burger-500/30 border-t-burger-500 rounded-full animate-spin" /></div>
      ) : pruefungen.length === 0 ? (
        <div className="burger-card text-center py-16">
          <ClipboardCheck size={40} className="text-dark-500 mx-auto mb-3" />
          <p className="text-dark-400 mb-2">Noch keine Hygiene-Prüfungen vorhanden.</p>
          {hasPermission('hygiene.verwalten') && (
            <button className="btn-burger mt-2" onClick={() => setNeueModal(true)}>Erste Prüfung erstellen</button>
          )}
        </div>
      ) : (
        <div className="burger-card overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Datum</th>
                <th>Art</th>
                <th>Durchgeführt von</th>
                <th>Fortschritt</th>
                <th>Status</th>
                <th>Aktion</th>
              </tr>
            </thead>
            <tbody>
              {pruefungen.map(p => {
                const progress = p.eintraege_gesamt > 0
                  ? Math.round((p.eintraege_erledigt / p.eintraege_gesamt) * 100)
                  : 0;
                return (
                  <tr key={p.id}>
                    <td className="text-white font-medium">{formatDatum(p.datum)}</td>
                    <td><span className={`badge ${TYP_COLOR[p.typ]}`}>{TYP_LABEL[p.typ]}</span></td>
                    <td className="text-dark-300">
                      {p.mitarbeiter ? `${p.mitarbeiter.vorname} ${p.mitarbeiter.nachname}` : '—'}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-dark-700 rounded-full h-1.5">
                          <div className="h-1.5 rounded-full" style={{ width: `${progress}%`, backgroundColor: progress === 100 ? '#22c55e' : '#C8171E' }} />
                        </div>
                        <span className="text-dark-400 text-xs">{p.eintraege_erledigt}/{p.eintraege_gesamt}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${p.abgeschlossen ? 'badge-available' : 'badge-open'}`}>
                        {p.abgeschlossen ? '✓ Abgeschlossen' : 'Offen'}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button onClick={() => openDetail(p.id)} className="btn-ghost py-1 px-3 text-xs">Öffnen</button>
                        {hasPermission('hygiene.verwalten') && (
                          <button onClick={() => setDeleteId(p.id)} className="p-1.5 text-dark-400 hover:text-burger-400 rounded transition-colors"><Trash2 size={13} /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Neue Prüfung Modal */}
      {neueModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h2 className="font-display text-xl text-white tracking-wide">NEUE HYGIENE-PRÜFUNG</h2>
              <button onClick={() => setNeueModal(false)} className="text-dark-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="modal-body space-y-3">
              {error && <div className="alert alert-error">{error}</div>}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-burger">Art der Prüfung</label>
                  <select className="select-burger" value={neueForm.typ} onChange={e => setNeueForm(f => ({ ...f, typ: e.target.value }))}>
                    <option value="taeglich">Täglich</option>
                    <option value="woechentlich">Wöchentlich</option>
                    <option value="monatlich">Monatlich</option>
                    <option value="sonder">Sonderprüfung</option>
                  </select>
                </div>
                <div>
                  <label className="label-burger">Datum</label>
                  <input type="date" className="input-burger" value={neueForm.datum} onChange={e => setNeueForm(f => ({ ...f, datum: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="label-burger">Notiz (optional)</label>
                <input className="input-burger" value={neueForm.notiz} onChange={e => setNeueForm(f => ({ ...f, notiz: e.target.value }))} placeholder="z.B. Behördenbesuch angekündigt" />
              </div>
              <p className="text-dark-400 text-xs">Alle aktiven Checkpunkte werden automatisch übernommen.</p>
            </div>
            <div className="modal-footer">
              <button className="btn-ghost" onClick={() => setNeueModal(false)}>Abbrechen</button>
              <button className="btn-burger" onClick={handleNeue} disabled={saving}>{saving ? '...' : 'Prüfung starten'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Lösch-Dialog */}
      {deleteId && (
        <div className="modal-overlay">
          <div className="modal-box max-w-sm">
            <div className="modal-body text-center py-2">
              <Trash2 size={32} className="text-burger-500 mx-auto mb-3" />
              <p className="text-white font-medium mb-1">Prüfung löschen?</p>
              <p className="text-dark-400 text-sm">Alle Einträge werden unwiderruflich gelöscht.</p>
            </div>
            <div className="modal-footer justify-center">
              <button className="btn-ghost" onClick={() => setDeleteId(null)}>Abbrechen</button>
              <button className="btn-burger" onClick={() => handleDelete(deleteId)}>Löschen</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Hygiene;
