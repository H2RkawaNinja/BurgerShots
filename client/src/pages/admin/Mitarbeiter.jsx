import { useEffect, useState } from 'react';
import { Plus, Pencil, UserCheck, UserX } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const Mitarbeiter = () => {
  const { hasPermission } = useAuth();
  const [mitarbeiter, setMitarbeiter] = useState([]);
  const [rollen, setRollen] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [newPasswort, setNewPasswort] = useState('');

  const load = async () => {
    const [mRes, rRes] = await Promise.all([api.get('/mitarbeiter'), api.get('/rollen')]);
    setMitarbeiter(mRes.data);
    setRollen(rRes.data);
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setForm({ vorname: '', nachname: '', email: '', benutzername: '', rolle_id: '' });
    setNewPasswort(''); setError(''); setModal({ mode: 'create' });
  };

  const openEdit = (m) => {
    setForm({ vorname: m.vorname, nachname: m.nachname, email: m.email, benutzername: m.benutzername, rolle_id: m.rolle_id });
    setNewPasswort(''); setError(''); setModal({ mode: 'edit', item: m });
  };

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      if (modal.mode === 'create') {
        const res = await api.post('/mitarbeiter', form);
        setNewPasswort(res.data.tempPasswort || '');
        load();
        if (!res.data.tempPasswort) setModal(null);
      } else {
        await api.put(`/mitarbeiter/${modal.item.id}`, form);
        setModal(null); load();
      }
    } catch (e) { setError(e.response?.data?.error || 'Fehler.'); }
    finally { setSaving(false); }
  };

  const toggleAktiv = async (m) => {
    await api.patch(`/mitarbeiter/${m.id}/status`, { aktiv: !m.aktiv });
    load();
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">MITARBEITER</h1>
          <p className="page-subtitle">{mitarbeiter.filter(m => m.aktiv).length} aktive Mitarbeiter</p>
        </div>
        {hasPermission('mitarbeiter.verwalten') && (
          <button className="btn-burger flex items-center gap-2" onClick={openCreate}><Plus size={16} /> Neuer Mitarbeiter</button>
        )}
      </div>

      <div className="burger-card overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr><th>Name</th><th>Benutzername</th><th>E-Mail</th><th>Rolle</th><th>Status</th>
              {hasPermission('mitarbeiter.verwalten') && <th>Aktionen</th>}
            </tr>
          </thead>
          <tbody>
            {mitarbeiter.map(m => (
              <tr key={m.id}>
                <td className="font-medium text-white">{m.vorname} {m.nachname}</td>
                <td className="text-dark-300 font-mono text-sm">@{m.benutzername}</td>
                <td className="text-dark-400 text-sm">{m.email}</td>
                <td>
                  {m.rolle && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: m.rolle.farbe + '22', color: m.rolle.farbe }}>
                      {m.rolle.name}
                    </span>
                  )}
                </td>
                <td><span className={`badge ${m.aktiv ? 'badge-available' : 'badge-unavailable'}`}>{m.aktiv ? 'Aktiv' : 'Inaktiv'}</span></td>
                {hasPermission('mitarbeiter.verwalten') && (
                  <td>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(m)} className="p-1.5 text-dark-400 hover:text-amber-400 rounded transition-colors"><Pencil size={14} /></button>
                      <button onClick={() => toggleAktiv(m)} className={`p-1.5 rounded transition-colors ${m.aktiv ? 'text-dark-400 hover:text-burger-400' : 'text-dark-400 hover:text-green-400'}`}>
                        {m.aktiv ? <UserX size={14} /> : <UserCheck size={14} />}
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div className="modal-header">
              <h2 className="font-display text-xl text-white tracking-wide">{modal.mode === 'create' ? 'NEUER MITARBEITER' : 'MITARBEITER BEARBEITEN'}</h2>
              <button onClick={() => setModal(null)} className="text-dark-400 hover:text-white"><svg viewBox="0 0 24 24" width="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg></button>
            </div>
            <div className="modal-body space-y-3">
              {error && <div className="alert alert-error">{error}</div>}
              {newPasswort && (
                <div className="alert alert-success">
                  <div>Mitarbeiter erstellt! Temporäres Passwort:</div>
                  <code className="font-mono font-bold text-lg">{newPasswort}</code>
                  <div className="text-xs mt-1">Bitte sofort weitergeben. Es wird nur einmal angezeigt.</div>
                </div>
              )}
              {!newPasswort && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="label-burger">Vorname *</label><input className="input-burger" value={form.vorname} onChange={e => setForm(f => ({ ...f, vorname: e.target.value }))} /></div>
                    <div><label className="label-burger">Nachname *</label><input className="input-burger" value={form.nachname} onChange={e => setForm(f => ({ ...f, nachname: e.target.value }))} /></div>
                  </div>
                  <div><label className="label-burger">E-Mail *</label><input type="email" className="input-burger" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
                  <div><label className="label-burger">Benutzername *</label><input className="input-burger" value={form.benutzername} onChange={e => setForm(f => ({ ...f, benutzername: e.target.value }))} /></div>
                  <div><label className="label-burger">Rolle</label>
                    <select className="select-burger" value={form.rolle_id} onChange={e => setForm(f => ({ ...f, rolle_id: e.target.value }))}>
                      <option value="">— keine —</option>
                      {rollen.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-ghost" onClick={() => setModal(null)}>{newPasswort ? 'Schließen' : 'Abbrechen'}</button>
              {!newPasswort && <button className="btn-burger" onClick={handleSave} disabled={saving}>{saving ? '...' : 'Speichern'}</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mitarbeiter;
