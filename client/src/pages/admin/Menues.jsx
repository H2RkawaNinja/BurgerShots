import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search, X } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const Menues = () => {
  const { hasPermission } = useAuth();
  const [menues, setMenues] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // null | { mode: 'create'|'edit', menue? }
  const [form, setForm] = useState({});
  const [selectedItems, setSelectedItems] = useState([]); // [{menu_item_id, menge, _item}]
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [itemSearch, setItemSearch] = useState('');

  const load = async () => {
    try {
      const [menuesRes, itemsRes] = await Promise.all([api.get('/menues'), api.get('/menu')]);
      setMenues(menuesRes.data);
      setMenuItems(itemsRes.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setForm({ name: '', beschreibung: '', preis: '', verfuegbar: true });
    setSelectedItems([]);
    setImageFile(null);
    setError('');
    setItemSearch('');
    setModal({ mode: 'create' });
  };

  const openEdit = (menue) => {
    setForm({ name: menue.name, beschreibung: menue.beschreibung || '', preis: menue.preis, verfuegbar: menue.verfuegbar });
    setSelectedItems(
      (menue.menue_items || []).map(mi => ({
        menu_item_id: mi.menu_item_id,
        menge: mi.menge,
        _item: mi.menu_item
      }))
    );
    setImageFile(null);
    setError('');
    setItemSearch('');
    setModal({ mode: 'edit', menue });
  };

  const addItem = (item) => {
    if (selectedItems.find(s => s.menu_item_id === item.id)) return;
    setSelectedItems(prev => [...prev, { menu_item_id: item.id, menge: 1, _item: item }]);
    setItemSearch('');
  };

  const removeItem = (menu_item_id) => {
    setSelectedItems(prev => prev.filter(s => s.menu_item_id !== menu_item_id));
  };

  const updateMenge = (menu_item_id, val) => {
    setSelectedItems(prev =>
      prev.map(s => s.menu_item_id === menu_item_id ? { ...s, menge: Math.max(1, parseInt(val) || 1) } : s)
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('beschreibung', form.beschreibung || '');
      fd.append('preis', form.preis);
      fd.append('verfuegbar', form.verfuegbar);
      fd.append('items', JSON.stringify(selectedItems.map(s => ({ menu_item_id: s.menu_item_id, menge: s.menge }))));
      if (imageFile) fd.append('bild', imageFile);

      if (modal.mode === 'create') {
        await api.post('/menues', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.put(`/menues/${modal.menue.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
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
    try { await api.delete(`/menues/${id}`); load(); } catch (e) { alert('Löschen fehlgeschlagen.'); }
  };

  const filteredMenues = menues.filter(m =>
    !search || m.name.toLowerCase().includes(search.toLowerCase())
  );

  const availableToAdd = menuItems.filter(item =>
    !selectedItems.find(s => s.menu_item_id === item.id) &&
    (!itemSearch || item.name.toLowerCase().includes(itemSearch.toLowerCase()))
  );

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">MENÜS</h1>
          <p className="page-subtitle">{menues.length} Menüs insgesamt</p>
        </div>
        {hasPermission('speisekarte.erstellen') && (
          <button className="btn-burger flex items-center gap-2" onClick={openCreate}>
            <Plus size={16} /> Neues Menü
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
          <input className="input-burger pl-9" placeholder="Suchen..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
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
                <th>Enthält</th>
                <th>Preis</th>
                <th>Status</th>
                <th>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {filteredMenues.map(menue => (
                <tr key={menue.id}>
                  <td>
                    {menue.bild
                      ? <img src={menue.bild} alt={menue.name} className="w-12 h-12 object-cover rounded-lg" />
                      : <div className="w-12 h-12 bg-dark-700 rounded-lg flex items-center justify-center text-2xl">🍽️</div>
                    }
                  </td>
                  <td>
                    <div className="font-medium text-white">{menue.name}</div>
                    {menue.beschreibung && <div className="text-xs text-dark-400 mt-0.5 line-clamp-1">{menue.beschreibung}</div>}
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {(menue.menue_items || []).map(mi => (
                        <span key={mi.menu_item_id} className="text-xs bg-dark-700 text-dark-200 px-2 py-0.5 rounded">
                          {mi.menge > 1 ? `${mi.menge}× ` : ''}{mi.menu_item?.name || '?'}
                        </span>
                      ))}
                      {(menue.menue_items || []).length === 0 && <span className="text-dark-500 text-xs">—</span>}
                    </div>
                  </td>
                  <td className="text-amber-400 font-semibold">{parseFloat(menue.preis).toFixed(2)} €</td>
                  <td>
                    <span className={`badge ${menue.verfuegbar ? 'badge-available' : 'badge-unavailable'}`}>
                      {menue.verfuegbar ? '✓ Verfügbar' : '✗ Nicht verfügbar'}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      {hasPermission('speisekarte.bearbeiten') && (
                        <button onClick={() => openEdit(menue)} className="p-2 text-dark-400 hover:text-amber-400 transition-colors rounded">
                          <Pencil size={15} />
                        </button>
                      )}
                      {hasPermission('speisekarte.loeschen') && (
                        <button onClick={() => handleDelete(menue.id, menue.name)} className="p-2 text-dark-400 hover:text-burger-400 transition-colors rounded">
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredMenues.length === 0 && (
                <tr><td colSpan={6} className="text-center text-dark-400 py-10">Keine Menüs gefunden.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="modal-overlay">
          <div className="modal-box max-w-2xl">
            <div className="modal-header">
              <h2 className="font-display text-xl text-white tracking-wide">
                {modal.mode === 'create' ? 'NEUES MENÜ' : 'MENÜ BEARBEITEN'}
              </h2>
              <button onClick={() => setModal(null)} className="text-dark-400 hover:text-white">
                <svg viewBox="0 0 24 24" width="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="modal-body max-h-[70vh] overflow-y-auto space-y-4">
              {error && <div className="alert alert-error">{error}</div>}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="label-burger">Name *</label>
                  <input className="input-burger" value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <label className="label-burger">Preis (€) *</label>
                  <input type="number" step="0.01" className="input-burger" value={form.preis || ''} onChange={e => setForm(f => ({ ...f, preis: e.target.value }))} />
                </div>
                <div>
                  <label className="label-burger">Bild</label>
                  <input type="file" accept="image/*" className="input-burger text-sm" onChange={e => setImageFile(e.target.files[0])} />
                </div>
                <div className="col-span-2">
                  <label className="label-burger">Beschreibung</label>
                  <textarea className="input-burger h-20 resize-none" value={form.beschreibung || ''} onChange={e => setForm(f => ({ ...f, beschreibung: e.target.value }))} />
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <input type="checkbox" className="accent-burger-500" id="menue-verfuegbar" checked={!!form.verfuegbar} onChange={e => setForm(f => ({ ...f, verfuegbar: e.target.checked }))} />
                  <label htmlFor="menue-verfuegbar" className="text-sm text-dark-200 cursor-pointer">Verfügbar</label>
                </div>
              </div>

              {/* Item selector */}
              <div>
                <label className="label-burger">Enthaltene Items</label>

                {/* Selected items list */}
                {selectedItems.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {selectedItems.map(s => (
                      <div key={s.menu_item_id} className="flex items-center gap-3 bg-dark-700 rounded-lg px-3 py-2">
                        <span className="flex-1 text-sm text-white">{s._item?.name || '?'}</span>
                        <span className="text-xs text-dark-400 w-14 text-right">
                          {s._item?.preis ? `${parseFloat(s._item.preis).toFixed(2)} €` : ''}
                        </span>
                        <input
                          type="number"
                          min={1}
                          className="w-14 input-burger text-sm py-1 text-center"
                          value={s.menge}
                          onChange={e => updateMenge(s.menu_item_id, e.target.value)}
                        />
                        <button onClick={() => removeItem(s.menu_item_id)} className="text-dark-400 hover:text-burger-400 transition-colors">
                          <X size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Search to add */}
                <div className="relative mb-1">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
                  <input
                    className="input-burger pl-9 text-sm"
                    placeholder="Item suchen und hinzufügen..."
                    value={itemSearch}
                    onChange={e => setItemSearch(e.target.value)}
                  />
                </div>
                {itemSearch && (
                  <div className="border border-dark-600 rounded-lg max-h-48 overflow-y-auto">
                    {availableToAdd.length === 0 ? (
                      <p className="text-center text-dark-400 text-sm py-4">Keine Items gefunden</p>
                    ) : (
                      availableToAdd.slice(0, 10).map(item => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => addItem(item)}
                          className="flex items-center gap-3 w-full px-3 py-2 hover:bg-dark-700 transition-colors text-left"
                        >
                          {item.bild
                            ? <img src={item.bild} alt="" className="w-8 h-8 object-cover rounded" />
                            : <div className="w-8 h-8 bg-dark-700 rounded flex items-center justify-center text-sm">{item.kategorie?.icon || '🍔'}</div>
                          }
                          <span className="flex-1 text-sm text-white">{item.name}</span>
                          <span className="text-xs text-amber-400">{parseFloat(item.preis).toFixed(2)} €</span>
                          <Plus size={14} className="text-dark-400" />
                        </button>
                      ))
                    )}
                  </div>
                )}
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

export default Menues;
