import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import api from '../../services/api';

const RECHTE_KATEGORIEN = ['dashboard', 'speisekarte', 'bestellungen', 'tagesangebote', 'lagerbestand', 'statistiken', 'mitarbeiter', 'rollen', 'log'];

const Rollen = () => {
  const [rollen, setRollen] = useState([]);
  const [rechte, setRechte] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: '', beschreibung: '', farbe: '#C8171E', rechte: [] });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    const [rRes, rechteRes] = await Promise.all([api.get('/rollen'), api.get('/rechte')]);
    setRollen(rRes.data);
    setRechte(rechteRes.data);
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setForm({ name: '', beschreibung: '', farbe: '#C8171E', rechte: [] });
    setError(''); setModal({ mode: 'create' });
  };

  const openEdit = (r) => {
    setForm({ name: r.name, beschreibung: r.beschreibung || '', farbe: r.farbe || '#C8171E', rechte: r.rechte?.map(rec => rec.id) || [] });
    setError(''); setModal({ mode: 'edit', item: r });
  };

  const toggleRecht = (id) => {
    setForm(f => ({
      ...f,
      rechte: f.rechte.includes(id) ? f.rechte.filter(r => r !== id) : [...f.rechte, id]
    }));
  };

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      if (modal.mode === 'create') await api.post('/rollen', form);
      else await api.put(`/rollen/${modal.item.id}`, form);
      setModal(null); load();
    } catch (e) { setError(e.response?.data?.error || 'Fehler.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Rolle "${name}" wirklich löschen?`)) return;
    try { await api.delete(`/rollen/${id}`); load(); }
    catch (e) { alert(e.response?.data?.error || 'Löschen fehlgeschlagen.'); }
  };

  const rechteByKat = (kat) => rechte.filter(r => r.kategorie === kat);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">ROLLEN</h1>
          <p className="page-subtitle">{rollen.length} Rollen konfiguriert</p>
        </div>
        <button className="btn-burger flex items-center gap-2" onClick={openCreate}><Plus size={16} /> Neue Rolle</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rollen.map(r => (
          <div key={r.id} className="burger-card p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: r.farbe + '33', border: `2px solid ${r.farbe}44`, color: r.farbe }}>
                  {r.name[0]}
                </div>
                <div>
                  <h3 className="font-semibold text-white">{r.name}</h3>
                  <p className="text-dark-400 text-xs">{r.beschreibung}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(r)} className="p-1.5 text-dark-400 hover:text-amber-400 rounded transition-colors"><Pencil size={14} /></button>
                <button onClick={() => handleDelete(r.id, r.name)} className="p-1.5 text-dark-400 hover:text-burger-400 rounded transition-colors"><Trash2 size={14} /></button>
              </div>
            </div>
            <div className="flex flex-wrap gap-1">
              {r.rechte?.slice(0, 6).map(rec => (
                <span key={rec.id} className="px-1.5 py-0.5 bg-dark-700 text-dark-300 text-xs rounded">{rec.schluessel}</span>
              ))}
              {r.rechte?.length > 6 && <span className="px-1.5 py-0.5 bg-dark-700 text-dark-400 text-xs rounded">+{r.rechte.length - 6} mehr</span>}
              {(!r.rechte || r.rechte.length === 0) && <span className="text-dark-500 text-xs">Keine Rechte</span>}
            </div>
            <div className="mt-3 pt-3 border-t border-dark-700 text-xs text-dark-500">
              {r._count?.mitarbeiter || 0} Mitarbeiter
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="modal-overlay">
          <div className="modal-box max-w-2xl">
            <div className="modal-header">
              <h2 className="font-display text-xl text-white tracking-wide">{modal.mode === 'create' ? 'NEUE ROLLE' : 'ROLLE BEARBEITEN'}</h2>
              <button onClick={() => setModal(null)} className="text-dark-400 hover:text-white"><svg viewBox="0 0 24 24" width="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg></button>
            </div>
            <div className="modal-body max-h-[70vh] overflow-y-auto space-y-4">
              {error && <div className="alert alert-error">{error}</div>}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2"><label className="label-burger">Name *</label><input className="input-burger" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
                <div><label className="label-burger">Farbe</label><input type="color" className="input-burger p-1 h-10 cursor-pointer" value={form.farbe} onChange={e => setForm(f => ({ ...f, farbe: e.target.value }))} /></div>
              </div>
              <div><label className="label-burger">Beschreibung</label><input className="input-burger" value={form.beschreibung} onChange={e => setForm(f => ({ ...f, beschreibung: e.target.value }))} /></div>

              <div>
                <label className="label-burger mb-3">Berechtigungen</label>
                <div className="space-y-3">
                  {RECHTE_KATEGORIEN.map(kat => {
                    const katRechte = rechteByKat(kat);
                    if (katRechte.length === 0) return null;
                    return (
                      <div key={kat} className="bg-dark-700 rounded-lg p-3">
                        <div className="text-xs font-semibold text-dark-300 uppercase tracking-wider mb-2 capitalize">{kat}</div>
                        <div className="flex flex-wrap gap-2">
                          {katRechte.map(r => (
                            <label key={r.id} className="flex items-center gap-1.5 text-sm text-dark-200 cursor-pointer hover:text-white transition-colors">
                              <input type="checkbox" className="accent-burger-500" checked={form.rechte.includes(r.id)} onChange={() => toggleRecht(r.id)} />
                              {r.name}
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-ghost" onClick={() => setModal(null)}>Abbrechen</button>
              <button className="btn-burger" onClick={handleSave} disabled={saving}>{saving ? 'Speichern...' : 'Speichern'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rollen;
