import { useEffect, useState } from 'react';
import { AlertTriangle, Pencil, Plus } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const Lagerbestand = () => {
  const { hasPermission } = useAuth();
  const [zutaten, setZutaten] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // { id, menge_aktuell, notiz }
  const [modal, setModal] = useState(false);
  const [zutatForm, setZutatForm] = useState({ name: '', einheit: 'kg', mindestbestand: 1, kategorie: 'fleisch' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const res = await api.get('/lagerbestand');
      setZutaten(res.data);
    } catch (e) {
      setError('Fehler beim Laden.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const startEdit = (item) => setEditing({
    id: item.id,
    menge_aktuell: item.lagerbestand?.menge_aktuell ?? 0,
    notiz: item.lagerbestand?.notiz || ''
  });

  const saveBestand = async () => {
    setSaving(true);
    try {
      await api.put(`/lagerbestand/${editing.id}`, { menge_aktuell: editing.menge_aktuell, notiz: editing.notiz });
      setEditing(null); load();
    } catch (e) { setError('Fehler beim Speichern.'); }
    finally { setSaving(false); }
  };

  const handleAddZutat = async () => {
    setSaving(true); setError('');
    try {
      await api.post('/lagerbestand/zutaten', zutatForm);
      setModal(false); load();
    } catch (e) { setError(e.response?.data?.error || 'Fehler.'); }
    finally { setSaving(false); }
  };

  const niedrigCount = zutaten.filter(z =>
    parseFloat(z.lagerbestand?.menge_aktuell ?? 0) < parseFloat(z.mindestbestand ?? 0)
  ).length;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">LAGERBESTAND</h1>
          <p className="page-subtitle">{niedrigCount} Zutaten unter Mindestbestand</p>
        </div>
        {hasPermission('lagerbestand.verwalten') && (
          <button className="btn-burger flex items-center gap-2" onClick={() => { setZutatForm({ name: '', einheit: 'kg', mindestbestand: 1, kategorie: 'fleisch' }); setModal(true); }}>
            <Plus size={16} /> Zutat hinzufügen
          </button>
        )}
      </div>

      {error && <div className="alert alert-error mb-4">{error}</div>}

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-burger-500/30 border-t-burger-500 rounded-full animate-spin" /></div>
      ) : (
        <div className="burger-card overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr><th>Zutat</th><th>Kategorie</th><th>Aktuell</th><th>Mindestbestand</th><th>Status</th><th>Letzte Aktualisierung</th>
                {hasPermission('lagerbestand.verwalten') && <th>Aktion</th>}
              </tr>
            </thead>
            <tbody>
              {zutaten.length === 0 ? (
                <tr><td colSpan="7" className="text-center text-dark-400 py-8">Keine Zutaten vorhanden.</td></tr>
              ) : zutaten.map(item => {
                const mengeAktuell = parseFloat(item.lagerbestand?.menge_aktuell ?? 0);
                const mindest = parseFloat(item.mindestbestand ?? 0);
                const low = mengeAktuell < mindest;
                const isEditing = editing?.id === item.id;
                return (
                  <tr key={item.id} className={low ? 'bg-burger-500/5' : ''}>
                    <td>
                      <div className="flex items-center gap-2">
                        {low && <AlertTriangle size={14} className="text-burger-400" />}
                        <span className={`font-medium ${low ? 'text-burger-300' : 'text-white'}`}>{item.name}</span>
                      </div>
                    </td>
                    <td className="text-dark-400 capitalize">{item.kategorie || '—'}</td>
                    <td>
                      {isEditing ? (
                        <input type="number" step="0.1" className="input-burger py-1 w-24" value={editing.menge_aktuell}
                          onChange={e => setEditing(ed => ({ ...ed, menge_aktuell: e.target.value }))} />
                      ) : (
                        <span className={`font-semibold ${low ? 'text-burger-400' : 'text-white'}`}>
                          {mengeAktuell.toFixed(1)} {item.einheit}
                        </span>
                      )}
                    </td>
                    <td className="text-dark-400">{mindest.toFixed(1)} {item.einheit}</td>
                    <td>
                      <span className={`badge ${low ? 'badge-cancelled' : 'badge-available'}`}>{low ? '⚠ Niedrig' : '✓ OK'}</span>
                    </td>
                    <td className="text-dark-400 text-xs">
                      {item.lagerbestand?.letzte_aktualisierung
                        ? new Date(item.lagerbestand.letzte_aktualisierung).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
                        : '—'}
                    </td>
                    {hasPermission('lagerbestand.verwalten') && (
                      <td>
                        {isEditing ? (
                          <div className="flex gap-2">
                            <button className="btn-burger py-1 px-3 text-xs" onClick={saveBestand} disabled={saving}>Speichern</button>
                            <button className="btn-ghost py-1 px-3 text-xs" onClick={() => setEditing(null)}>Abbrechen</button>
                          </div>
                        ) : (
                          <button onClick={() => startEdit(item)} className="p-1.5 text-dark-400 hover:text-amber-400 rounded transition-colors"><Pencil size={14} /></button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h2 className="font-display text-xl text-white tracking-wide">ZUTAT HINZUFÜGEN</h2>
              <button onClick={() => setModal(false)} className="text-dark-400 hover:text-white"><svg viewBox="0 0 24 24" width="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg></button>
            </div>
            <div className="modal-body space-y-3">
              {error && <div className="alert alert-error">{error}</div>}
              <div><label className="label-burger">Name *</label><input className="input-burger" value={zutatForm.name} onChange={e => setZutatForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label-burger">Einheit</label>
                  <select className="select-burger" value={zutatForm.einheit} onChange={e => setZutatForm(f => ({ ...f, einheit: e.target.value }))}>
                    {['kg', 'g', 'l', 'ml', 'stk', 'pkg'].map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div><label className="label-burger">Mindestbestand</label><input type="number" step="0.1" className="input-burger" value={zutatForm.mindestbestand} onChange={e => setZutatForm(f => ({ ...f, mindestbestand: parseFloat(e.target.value) }))} /></div>
              </div>
              <div><label className="label-burger">Kategorie</label>
                <select className="select-burger" value={zutatForm.kategorie} onChange={e => setZutatForm(f => ({ ...f, kategorie: e.target.value }))}>
                  {['fleisch', 'gemuese', 'milchprodukte', 'brot', 'getraenke', 'gewuerze', 'sonstiges'].map(k => <option key={k} value={k} className="capitalize">{k}</option>)}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-ghost" onClick={() => setModal(false)}>Abbrechen</button>
              <button className="btn-burger" onClick={handleAddZutat} disabled={saving}>{saving ? '...' : 'Hinzufügen'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Lagerbestand;
