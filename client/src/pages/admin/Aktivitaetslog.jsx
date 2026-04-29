import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import api from '../../services/api';

const KATEGORIEN = ['alle', 'auth', 'menu', 'bestellungen', 'tagesangebote', 'lagerbestand', 'mitarbeiter', 'rollen'];

const Aktivitaetslog = () => {
  const [log, setLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterKat, setFilterKat] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const PER_PAGE = 20;

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: PER_PAGE });
      if (filterKat && filterKat !== 'alle') params.append('kategorie', filterKat);
      const res = await api.get(`/log?${params}`);
      if (Array.isArray(res.data)) {
        setLog(res.data);
        setTotal(res.data.length < PER_PAGE ? (page - 1) * PER_PAGE + res.data.length : page * PER_PAGE + 1);
      } else {
        setLog(res.data.rows || res.data.log || []);
        setTotal(res.data.total || 0);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { setPage(1); }, [filterKat]);
  useEffect(() => { load(); }, [filterKat, page]);

  const filtered = search
    ? log.filter(e => e.aktion.toLowerCase().includes(search.toLowerCase()) || e.mitarbeiter_name?.toLowerCase().includes(search.toLowerCase()))
    : log;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">AKTIVITÄTSLOG</h1>
          <p className="page-subtitle">Alle Systemaktivitäten</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
          <input className="input-burger pl-9" placeholder="Suchen..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {KATEGORIEN.map(k => (
            <button key={k} onClick={() => setFilterKat(k === 'alle' ? '' : k)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${(filterKat === k || (k === 'alle' && !filterKat)) ? 'bg-burger-500 text-white' : 'bg-dark-700 text-dark-300 hover:text-white'}`}>
              {k}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-burger-500/30 border-t-burger-500 rounded-full animate-spin" /></div>
      ) : (
        <>
          <div className="burger-card overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr><th>Aktion</th><th>Kategorie</th><th>Mitarbeiter</th><th>Zeit</th><th>Details</th></tr>
              </thead>
              <tbody>
                {filtered.map(entry => (
                  <tr key={entry.id}>
                    <td className="text-dark-200">{entry.aktion}</td>
                    <td><span className="badge">{entry.kategorie}</span></td>
                    <td className="text-dark-400 text-sm">{entry.mitarbeiter_name || '—'}</td>
                    <td className="text-dark-400 text-xs">{new Date(entry.erstellt_am).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="text-dark-500 text-xs max-w-[200px] truncate">
                      {entry.details ? JSON.stringify(entry.details).slice(0, 80) : '—'}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={5} className="text-center text-dark-400 py-10">Keine Einträge.</td></tr>}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <span className="text-dark-400 text-sm">Seite {page}</span>
            <div className="flex gap-2">
              <button className="btn-ghost py-1.5 px-4 text-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Zurück</button>
              <button className="btn-ghost py-1.5 px-4 text-sm" onClick={() => setPage(p => p + 1)} disabled={log.length < PER_PAGE}>Weiter →</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Aktivitaetslog;
