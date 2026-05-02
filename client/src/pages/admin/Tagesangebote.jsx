import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Tag } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const Tagesangebote = () => {
  const { hasPermission } = useAuth();
  const [angebote, setAngebote] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [menues, setMenues] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    const [angRes, menuRes, menuesRes] = await Promise.all([api.get('/tagesangebote'), api.get('/menu'), api.get('/menues')]);
    setAngebote(angRes.data);
    setMenuItems(menuRes.data);
    setMenues(menuesRes.data);
  };
  useEffect(() => { load(); }, []);

  const today = new Date().toISOString().split('T')[0];

  const openCreate = () => {
    setForm({ name: '', beschreibung: '', rabatt_prozent: '', sonderpreis: '', verknuepfung_typ: 'item', menu_item_id: '', menue_id: '', gueltig_von: today, gueltig_bis: today, aktiv: true });
    setImageFile(null); setError(''); setModal({ mode: 'create' });
  };

  const openEdit = (a) => { setForm({ ...a, verknuepfung_typ: a.menue_id ? 'menue' : 'item' }); setImageFile(null); setError(''); setModal({ mode: 'edit', item: a }); };

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== null && v !== undefined) fd.append(k, v); });
      if (imageFile) fd.append('bild', imageFile);
      if (modal.mode === 'create') await api.post('/tagesangebote', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      else await api.put(`/tagesangebote/${modal.item.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setModal(null); load();
    } catch (e) { setError(e.response?.data?.error || 'Fehler.'); }
    finally { setSaving(false); }
  };

  const toggleAktiv = async (a) => {
    const fd = new FormData();
    Object.entries(a).forEach(([k, v]) => { if (v !== null && v !== undefined) fd.append(k, v); });
    fd.set('aktiv', !a.aktiv);
    await api.put(`/tagesangebote/${a.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    load();
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`"${name}" löschen?`)) return;
    await api.delete(`/tagesangebote/${id}`); load();
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">TAGESANGEBOTE</h1>
          <p className="page-subtitle">{angebote.filter(a => a.aktiv).length} aktive Angebote</p>
        </div>
        {hasPermission('tagesangebote.verwalten') && (
          <button className="btn-burger flex items-center gap-2" onClick={openCreate}><Plus size={16} /> Neues Angebot</button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {angebote.map(a => (
          <div key={a.id} className="burger-card overflow-hidden">
            {a.bild && <img src={a.bild} alt={a.name} className="w-full h-36 object-cover" />}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-white">{a.name}</h3>
                  <p className="text-dark-400 text-xs mt-0.5">{a.beschreibung}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  {hasPermission('tagesangebote.verwalten') && (
                    <>
                      <button onClick={() => openEdit(a)} className="p-1.5 text-dark-400 hover:text-amber-400 rounded transition-colors"><Pencil size={14} /></button>
                      <button onClick={() => handleDelete(a.id, a.name)} className="p-1.5 text-dark-400 hover:text-burger-400 rounded transition-colors"><Trash2 size={14} /></button>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 mt-3">
                {a.rabatt_prozent && (
                  <span className="px-2 py-0.5 bg-burger-500/20 text-burger-400 text-xs font-bold rounded-full">-{a.rabatt_prozent}%</span>
                )}
                {a.sonderpreis && (
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs font-bold rounded-full">${parseFloat(a.sonderpreis).toFixed(2)}</span>
                )}
              </div>

              <div className="text-xs text-dark-400 mt-2">
                {new Date(a.gueltig_von).toLocaleDateString('de-DE')} – {new Date(a.gueltig_bis).toLocaleDateString('de-DE')}
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-dark-700">
                <span className={`badge ${a.aktiv ? 'badge-available' : 'badge-unavailable'}`}>{a.aktiv ? 'Aktiv' : 'Inaktiv'}</span>
                {hasPermission('tagesangebote.verwalten') && (
                  <button onClick={() => toggleAktiv(a)} className="text-xs text-dark-400 hover:text-white transition-colors">
                    {a.aktiv ? 'Deaktivieren' : 'Aktivieren'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {angebote.length === 0 && (
          <div className="col-span-3 text-center text-dark-400 py-16">Keine Tagesangebote vorhanden.</div>
        )}
      </div>

      {modal && (
        <div className="modal-overlay">
          <div className="modal-box max-w-lg">
            <div className="modal-header">
              <h2 className="font-display text-xl text-white tracking-wide">{modal.mode === 'create' ? 'NEUES ANGEBOT' : 'ANGEBOT BEARBEITEN'}</h2>
              <button onClick={() => setModal(null)} className="text-dark-400 hover:text-white"><svg viewBox="0 0 24 24" width="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg></button>
            </div>
            <div className="modal-body space-y-3">
              {error && <div className="alert alert-error">{error}</div>}
              <div><label className="label-burger">Name *</label><input className="input-burger" value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div><label className="label-burger">Beschreibung</label><textarea className="input-burger h-16 resize-none" value={form.beschreibung || ''} onChange={e => setForm(f => ({ ...f, beschreibung: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label-burger">Rabatt (%)</label><input type="number" className="input-burger" value={form.rabatt_prozent || ''} onChange={e => setForm(f => ({ ...f, rabatt_prozent: e.target.value }))} /></div>
                <div><label className="label-burger">Sonderpreis ($)</label><input type="number" step="0.01" className="input-burger" value={form.sonderpreis || ''} onChange={e => setForm(f => ({ ...f, sonderpreis: e.target.value }))} /></div>
              </div>
              <div>
                <label className="label-burger">Verknüpfung</label>
                <div className="flex gap-2 mb-2">
                  <button type="button"
                    onClick={() => setForm(f => ({ ...f, verknuepfung_typ: 'item', menue_id: '' }))}
                    className={`flex-1 py-1.5 text-xs font-semibold tracking-wider uppercase border transition-colors ${
                      form.verknuepfung_typ !== 'menue' ? 'bg-burger-500 border-burger-500 text-white' : 'border-dark-600 text-dark-400 hover:border-dark-500'
                    }`}>
                    Menü-Item
                  </button>
                  <button type="button"
                    onClick={() => setForm(f => ({ ...f, verknuepfung_typ: 'menue', menu_item_id: '' }))}
                    className={`flex-1 py-1.5 text-xs font-semibold tracking-wider uppercase border transition-colors ${
                      form.verknuepfung_typ === 'menue' ? 'bg-burger-500 border-burger-500 text-white' : 'border-dark-600 text-dark-400 hover:border-dark-500'
                    }`}>
                    Menü
                  </button>
                </div>
                {form.verknuepfung_typ === 'menue' ? (
                  <select className="select-burger" value={form.menue_id || ''} onChange={e => setForm(f => ({ ...f, menue_id: e.target.value, menu_item_id: '' }))}>
                    <option value="">— keines —</option>
                    {menues.map(m => <option key={m.id} value={m.id}>🍽️ {m.name}</option>)}
                  </select>
                ) : (
                  <select className="select-burger" value={form.menu_item_id || ''} onChange={e => setForm(f => ({ ...f, menu_item_id: e.target.value, menue_id: '' }))}>
                    <option value="">— keines —</option>
                    {menuItems.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label-burger">Gültig von</label><input type="date" className="input-burger" value={form.gueltig_von?.split('T')[0] || ''} onChange={e => setForm(f => ({ ...f, gueltig_von: e.target.value }))} /></div>
                <div><label className="label-burger">Gültig bis</label><input type="date" className="input-burger" value={form.gueltig_bis?.split('T')[0] || ''} onChange={e => setForm(f => ({ ...f, gueltig_bis: e.target.value }))} /></div>
              </div>
              <div><label className="label-burger">Bild</label><input type="file" accept="image/*" className="input-burger text-sm" onChange={e => setImageFile(e.target.files[0])} /></div>
              <label className="flex items-center gap-2 text-sm text-dark-200 cursor-pointer">
                <input type="checkbox" className="accent-burger-500" checked={!!form.aktiv} onChange={e => setForm(f => ({ ...f, aktiv: e.target.checked }))} /> Aktiv
              </label>
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

export default Tagesangebote;
