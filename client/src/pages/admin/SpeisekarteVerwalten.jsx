import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search, Eye, EyeOff, Star } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const SpeisekarteVerwalten = () => {
  const { hasPermission } = useAuth();
  const [items, setItems] = useState([]);
  const [kategorien, setKategorien] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterKat, setFilterKat] = useState('');
  const [modal, setModal] = useState(null); // null | { mode: 'create'|'edit', item }
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState(null);

  const load = async () => {
    try {
      const [itemsRes, katRes] = await Promise.all([api.get('/menu'), api.get('/kategorien')]);
      setItems(itemsRes.data);
      setKategorien(katRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setForm({ name: '', beschreibung: '', preis: '', kategorie_id: '', kalorien: '', verfuegbar: true, featured: false, vegetarisch: false, vegan: false, scharf: false });
    setImageFile(null);
    setError('');
    setModal({ mode: 'create' });
  };

  const openEdit = (item) => {
    setForm({ ...item });
    setImageFile(null);
    setError('');
    setModal({ mode: 'edit', item });
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== null && v !== undefined) fd.append(k, v); });
      if (imageFile) fd.append('bild', imageFile);

      if (modal.mode === 'create') {
        await api.post('/menu', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.put(`/menu/${modal.item.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      setModal(null);
      load();
    } catch (e) {
      setError(e.response?.data?.error || 'Fehler beim Speichern.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`"${name}" wirklich löschen?`)) return;
    try { await api.delete(`/menu/${id}`); load(); } catch (e) { alert('Löschen fehlgeschlagen.'); }
  };

  const toggleVerfuegbar = async (item) => {
    try {
      const fd = new FormData();
      Object.entries(item).forEach(([k, v]) => { if (v !== null && v !== undefined) fd.append(k, v); });
      fd.set('verfuegbar', !item.verfuegbar);
      await api.put(`/menu/${item.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      load();
    } catch (e) { console.error(e); }
  };

  const filtered = items.filter(i =>
    (!search || i.name.toLowerCase().includes(search.toLowerCase())) &&
    (!filterKat || String(i.kategorie_id) === filterKat)
  );

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">SPEISEKARTE</h1>
          <p className="page-subtitle">{items.length} Menü-Items insgesamt</p>
        </div>
        {hasPermission('speisekarte.erstellen') && (
          <button className="btn-burger flex items-center gap-2" onClick={openCreate}>
            <Plus size={16} /> Neues Item
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
          <input className="input-burger pl-9" placeholder="Suchen..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="select-burger w-auto min-w-[160px]" value={filterKat} onChange={e => setFilterKat(e.target.value)}>
          <option value="">Alle Kategorien</option>
          {kategorien.map(k => <option key={k.id} value={k.id}>{k.icon} {k.name}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-burger-500/30 border-t-burger-500 rounded-full animate-spin" /></div>
      ) : (
        <div className="burger-card overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Bild</th>
                <th>Name</th>
                <th>Kategorie</th>
                <th>Preis</th>
                <th>Kalorien</th>
                <th>Status</th>
                <th>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.id}>
                  <td>
                    {item.bild
                      ? <img src={item.bild} alt={item.name} className="w-12 h-12 object-cover rounded-lg" />
                      : <div className="w-12 h-12 bg-dark-700 rounded-lg flex items-center justify-center text-2xl">{item.kategorie?.icon || '🍔'}</div>
                    }
                  </td>
                  <td>
                    <div className="font-medium text-white">{item.name}</div>
                    <div className="text-xs text-dark-400 flex gap-1 mt-0.5">
                      {item.featured && <span className="text-amber-400">★ Featured</span>}
                      {item.vegetarisch && <span className="text-green-400">🌿 Veg</span>}
                      {item.scharf && <span className="text-burger-400">🌶 Scharf</span>}
                    </div>
                  </td>
                  <td className="text-dark-300">{item.kategorie?.icon} {item.kategorie?.name || '—'}</td>
                  <td className="text-amber-400 font-semibold">{parseFloat(item.preis).toFixed(2)} €</td>
                  <td className="text-dark-400">{item.kalorien ? `${item.kalorien} kcal` : '—'}</td>
                  <td>
                    <button onClick={() => toggleVerfuegbar(item)} className={`badge cursor-pointer ${item.verfuegbar ? 'badge-available' : 'badge-unavailable'}`}>
                      {item.verfuegbar ? '✓ Verfügbar' : '✗ Nicht verfügbar'}
                    </button>
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      {hasPermission('speisekarte.bearbeiten') && (
                        <button onClick={() => openEdit(item)} className="p-2 text-dark-400 hover:text-amber-400 transition-colors rounded">
                          <Pencil size={15} />
                        </button>
                      )}
                      {hasPermission('speisekarte.loeschen') && (
                        <button onClick={() => handleDelete(item.id, item.name)} className="p-2 text-dark-400 hover:text-burger-400 transition-colors rounded">
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="text-center text-dark-400 py-10">Keine Einträge gefunden.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="modal-overlay">
          <div className="modal-box max-w-2xl">
            <div className="modal-header">
              <h2 className="font-display text-xl text-white tracking-wide">
                {modal.mode === 'create' ? 'NEUES MENÜ-ITEM' : 'ITEM BEARBEITEN'}
              </h2>
              <button onClick={() => setModal(null)} className="text-dark-400 hover:text-white"><svg viewBox="0 0 24 24" width="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg></button>
            </div>
            <div className="modal-body max-h-[70vh] overflow-y-auto space-y-4">
              {error && <div className="alert alert-error">{error}</div>}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="label-burger">Name *</label>
                  <input className="input-burger" value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <label className="label-burger">Kategorie</label>
                  <select className="select-burger" value={form.kategorie_id || ''} onChange={e => setForm(f => ({ ...f, kategorie_id: e.target.value }))}>
                    <option value="">— keine —</option>
                    {kategorien.map(k => <option key={k.id} value={k.id}>{k.icon} {k.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-burger">Preis (€) *</label>
                  <input type="number" step="0.01" className="input-burger" value={form.preis || ''} onChange={e => setForm(f => ({ ...f, preis: e.target.value }))} />
                </div>
                <div>
                  <label className="label-burger">Kalorien (kcal)</label>
                  <input type="number" className="input-burger" value={form.kalorien || ''} onChange={e => setForm(f => ({ ...f, kalorien: e.target.value }))} />
                </div>
                <div>
                  <label className="label-burger">Bild</label>
                  <input type="file" accept="image/*" className="input-burger text-sm" onChange={e => setImageFile(e.target.files[0])} />
                </div>
                <div className="col-span-2">
                  <label className="label-burger">Beschreibung</label>
                  <textarea className="input-burger h-20 resize-none" value={form.beschreibung || ''} onChange={e => setForm(f => ({ ...f, beschreibung: e.target.value }))} />
                </div>
                <div className="col-span-2">
                  <label className="label-burger">Allergene</label>
                  <input className="input-burger" placeholder="z.B. Gluten, Milch, Ei..." value={form.allergene || ''} onChange={e => setForm(f => ({ ...f, allergene: e.target.value }))} />
                </div>
              </div>
              <div className="flex flex-wrap gap-4 pt-2">
                {[
                  { key: 'verfuegbar', label: 'Verfügbar' },
                  { key: 'featured', label: 'Featured' },
                  { key: 'beliebt', label: 'Beliebt' },
                  { key: 'neu', label: 'Neu' },
                  { key: 'vegetarisch', label: '🌿 Vegetarisch' },
                  { key: 'vegan', label: '🌱 Vegan' },
                  { key: 'scharf', label: '🌶 Scharf' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 text-sm text-dark-200 cursor-pointer">
                    <input type="checkbox" className="accent-burger-500" checked={!!form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))} />
                    {label}
                  </label>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-ghost" onClick={() => setModal(null)}>Abbrechen</button>
              <button className="btn-burger" onClick={handleSave} disabled={saving}>
                {saving ? 'Speichern...' : 'Speichern'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpeisekarteVerwalten;
