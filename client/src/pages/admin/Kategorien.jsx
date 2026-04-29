import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const Kategorien = () => {
  const { hasPermission } = useAuth();
  const [kategorien, setKategorien] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: '', slug: '', icon: '🍔', reihenfolge: 99, aktiv: true });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    const res = await api.get('/kategorien');
    setKategorien(res.data);
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm({ name: '', slug: '', icon: '🍔', reihenfolge: 99, aktiv: true }); setError(''); setModal({ mode: 'create' }); };
  const openEdit = (k) => { setForm({ ...k }); setError(''); setModal({ mode: 'edit', item: k }); };

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      if (modal.mode === 'create') await api.post('/kategorien', form);
      else await api.put(`/kategorien/${modal.item.id}`, form);
      setModal(null); load();
    } catch (e) { setError(e.response?.data?.error || 'Fehler.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`"${name}" löschen?`)) return;
    try { await api.delete(`/kategorien/${id}`); load(); } catch (e) { alert('Löschen fehlgeschlagen.'); }
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">KATEGORIEN</h1>
          <p className="page-subtitle">{kategorien.length} Kategorien</p>
        </div>
        {hasPermission('speisekarte.erstellen') && (
          <button className="btn-burger flex items-center gap-2" onClick={openCreate}><Plus size={16} /> Neue Kategorie</button>
        )}
      </div>

      <div className="burger-card overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Icon</th><th>Name</th><th>Slug</th><th>Reihenfolge</th><th>Status</th><th>Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {kategorien.map(k => (
              <tr key={k.id}>
                <td className="text-2xl">{k.icon}</td>
                <td className="font-medium text-white">{k.name}</td>
                <td className="text-dark-400 font-mono text-sm">{k.slug}</td>
                <td className="text-dark-300">{k.reihenfolge}</td>
                <td><span className={`badge ${k.aktiv ? 'badge-available' : 'badge-unavailable'}`}>{k.aktiv ? 'Aktiv' : 'Inaktiv'}</span></td>
                <td>
                  <div className="flex gap-1">
                    {hasPermission('speisekarte.bearbeiten') && (
                      <button onClick={() => openEdit(k)} className="p-2 text-dark-400 hover:text-amber-400 rounded transition-colors"><Pencil size={15} /></button>
                    )}
                    {hasPermission('speisekarte.loeschen') && (
                      <button onClick={() => handleDelete(k.id, k.name)} className="p-2 text-dark-400 hover:text-burger-400 rounded transition-colors"><Trash2 size={15} /></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h2 className="font-display text-xl text-white tracking-wide">{modal.mode === 'create' ? 'NEUE KATEGORIE' : 'KATEGORIE BEARBEITEN'}</h2>
              <button onClick={() => setModal(null)} className="text-dark-400 hover:text-white"><svg viewBox="0 0 24 24" width="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg></button>
            </div>
            <div className="modal-body space-y-3">
              {error && <div className="alert alert-error">{error}</div>}
              <div><label className="label-burger">Name *</label><input className="input-burger" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
              <div><label className="label-burger">Slug</label><input className="input-burger" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} /></div>
              <div><label className="label-burger">Icon (Emoji)</label><input className="input-burger" value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} /></div>
              <div><label className="label-burger">Reihenfolge</label><input type="number" className="input-burger" value={form.reihenfolge} onChange={e => setForm(f => ({ ...f, reihenfolge: parseInt(e.target.value) }))} /></div>
              <label className="flex items-center gap-2 text-sm text-dark-200 cursor-pointer">
                <input type="checkbox" className="accent-burger-500" checked={form.aktiv} onChange={e => setForm(f => ({ ...f, aktiv: e.target.checked }))} /> Aktiv
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

export default Kategorien;
