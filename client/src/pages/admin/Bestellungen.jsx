import { useEffect, useState } from 'react';
import { Plus, ChevronDown, Search, RefreshCw } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const STATUS_OPTIONS = ['offen', 'zubereitung', 'fertig', 'abgeholt', 'storniert'];
const STATUS_CONFIG = {
  offen: { label: 'Offen', cls: 'badge-open' },
  zubereitung: { label: 'In Zubereitung', cls: 'badge-preparing' },
  fertig: { label: 'Fertig', cls: 'badge-ready' },
  abgeholt: { label: 'Abgeholt', cls: 'badge-picked-up' },
  storniert: { label: 'Storniert', cls: 'badge-cancelled' }
};

const Bestellungen = () => {
  const { hasPermission } = useAuth();
  const [bestellungen, setBestellungen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // 'detail' | 'create'
  const [selected, setSelected] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [createForm, setCreateForm] = useState({ items: [], notiz: '', tisch_nr: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.append('status', filterStatus);
      const res = await api.get(`/bestellungen?${params}`);
      setBestellungen(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filterStatus]);

  const openCreate = async () => {
    if (menuItems.length === 0) {
      const res = await api.get('/menu?verfuegbar=true');
      setMenuItems(res.data);
    }
    setCreateForm({ items: [], notiz: '', tisch_nr: '' });
    setError('');
    setModal('create');
  };

  const addItem = (menuItem) => {
    setCreateForm(f => {
      const existing = f.items.find(i => i.menu_item_id === menuItem.id);
      if (existing) {
        return { ...f, items: f.items.map(i => i.menu_item_id === menuItem.id ? { ...i, menge: i.menge + 1 } : i) };
      }
      return { ...f, items: [...f.items, { menu_item_id: menuItem.id, name: menuItem.name, preis: menuItem.preis, menge: 1 }] };
    });
  };

  const updateMenge = (id, menge) => {
    if (menge <= 0) {
      setCreateForm(f => ({ ...f, items: f.items.filter(i => i.menu_item_id !== id) }));
    } else {
      setCreateForm(f => ({ ...f, items: f.items.map(i => i.menu_item_id === id ? { ...i, menge } : i) }));
    }
  };

  const handleCreateSubmit = async () => {
    if (createForm.items.length === 0) { setError('Mindestens ein Item hinzufügen.'); return; }
    setSaving(true); setError('');
    try {
      await api.post('/bestellungen', createForm);
      setModal(null); load();
    } catch (e) { setError(e.response?.data?.error || 'Fehler.'); }
    finally { setSaving(false); }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.patch(`/bestellungen/${id}/status`, { status: newStatus });
      load();
    } catch (e) { console.error(e); }
  };

  const total = createForm.items.reduce((s, i) => s + parseFloat(i.preis) * i.menge, 0);

  const filtered = bestellungen.filter(b =>
    !search || b.bestellnummer.toLowerCase().includes(search.toLowerCase()) || (b.tisch_nr || '').includes(search)
  );

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">BESTELLUNGEN</h1>
          <p className="page-subtitle">{bestellungen.length} Bestellungen</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-ghost flex items-center gap-2" onClick={load}><RefreshCw size={15} /> Aktualisieren</button>
          {hasPermission('bestellungen.verwalten') && (
            <button className="btn-burger flex items-center gap-2" onClick={openCreate}><Plus size={16} /> Neue Bestellung</button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
          <input className="input-burger pl-9" placeholder="Bestellnummer / Tisch..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['', ...STATUS_OPTIONS].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterStatus === s ? 'bg-burger-500 text-white' : 'bg-dark-700 text-dark-300 hover:text-white'}`}>
              {s ? STATUS_CONFIG[s].label : 'Alle'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-burger-500/30 border-t-burger-500 rounded-full animate-spin" /></div>
      ) : (
        <div className="burger-card overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nummer</th><th>Status</th><th>Betrag</th><th>Items</th><th>Tisch</th><th>Zeit</th>
                {hasPermission('bestellungen.verwalten') && <th>Status ändern</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => {
                const sc = STATUS_CONFIG[b.status] || { label: b.status, cls: 'badge' };
                return (
                  <tr key={b.id}>
                    <td className="font-mono text-sm text-dark-200">{b.bestellnummer}</td>
                    <td><span className={`badge ${sc.cls}`}>{sc.label}</span></td>
                    <td className="text-amber-400 font-semibold">${parseFloat(b.gesamtbetrag).toFixed(2)}</td>
                    <td className="text-dark-300 text-sm">{b.items?.length || 0} Pos.</td>
                    <td className="text-dark-300">{b.tisch_nr || '—'}</td>
                    <td className="text-dark-400 text-xs">{new Date(b.erstellt_am).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
                    {hasPermission('bestellungen.verwalten') && (
                      <td>
                        <select
                          className="select-burger py-1 text-xs w-auto"
                          value={b.status}
                          onChange={e => handleStatusChange(b.id, e.target.value)}
                        >
                          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
                        </select>
                      </td>
                    )}
                  </tr>
                );
              })}
              {filtered.length === 0 && <tr><td colSpan={7} className="text-center text-dark-400 py-10">Keine Bestellungen.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      {modal === 'create' && (
        <div className="modal-overlay">
          <div className="modal-box max-w-2xl">
            <div className="modal-header">
              <h2 className="font-display text-xl text-white tracking-wide">NEUE BESTELLUNG</h2>
              <button onClick={() => setModal(null)} className="text-dark-400 hover:text-white"><svg viewBox="0 0 24 24" width="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg></button>
            </div>
            <div className="modal-body max-h-[70vh] overflow-y-auto">
              {error && <div className="alert alert-error mb-3">{error}</div>}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="label-burger">Tisch Nr.</label>
                  <input className="input-burger" placeholder="T1, T2, ..." value={createForm.tisch_nr} onChange={e => setCreateForm(f => ({ ...f, tisch_nr: e.target.value }))} />
                </div>
                <div>
                  <label className="label-burger">Notiz</label>
                  <input className="input-burger" placeholder="Optional..." value={createForm.notiz} onChange={e => setCreateForm(f => ({ ...f, notiz: e.target.value }))} />
                </div>
              </div>

              <h3 className="text-sm font-semibold text-dark-300 uppercase tracking-wider mb-3">Menü-Items</h3>
              <div className="grid grid-cols-2 gap-2 mb-4 max-h-48 overflow-y-auto">
                {menuItems.map(item => (
                  <button key={item.id} onClick={() => addItem(item)}
                    className="text-left p-3 bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors">
                    <div className="text-white text-sm font-medium">{item.name}</div>
                    <div className="text-amber-400 text-xs">${parseFloat(item.preis).toFixed(2)}</div>
                  </button>
                ))}
              </div>

              {createForm.items.length > 0 && (
                <div className="bg-dark-700 rounded-lg p-3">
                  <h3 className="text-sm font-semibold text-dark-300 mb-2">Warenkorb</h3>
                  {createForm.items.map(item => (
                    <div key={item.menu_item_id} className="flex items-center justify-between py-1.5 border-b border-dark-600 last:border-0">
                      <span className="text-white text-sm">{item.name}</span>
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateMenge(item.menu_item_id, item.menge - 1)} className="w-6 h-6 bg-dark-600 rounded text-white hover:bg-burger-500 transition-colors">−</button>
                        <span className="text-white text-sm w-5 text-center">{item.menge}</span>
                        <button onClick={() => updateMenge(item.menu_item_id, item.menge + 1)} className="w-6 h-6 bg-dark-600 rounded text-white hover:bg-green-600 transition-colors">+</button>
                        <span className="text-amber-400 text-sm w-16 text-right">${(parseFloat(item.preis) * item.menge).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between pt-2 font-semibold">
                    <span className="text-dark-300">Gesamt</span>
                    <span className="text-amber-400">${total.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-ghost" onClick={() => setModal(null)}>Abbrechen</button>
              <button className="btn-burger" onClick={handleCreateSubmit} disabled={saving}>
                {saving ? 'Erstellen...' : `Bestellung erstellen ($${total.toFixed(2)})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bestellungen;
