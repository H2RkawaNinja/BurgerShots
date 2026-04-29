import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ShoppingBag, TrendingUp, Clock } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const MeineStats = () => {
  const { user } = useAuth();
  const [log, setLog] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [logRes, statsRes] = await Promise.all([
          api.get('/log/meine?limit=20'),
          api.get('/stats/mitarbeiter'),
        ]);
        setLog(logRes.data);
        const meineStats = statsRes.data.find(m => m.id === user?.id);
        setStats(meineStats || null);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const aktionenByTag = log.reduce((acc, entry) => {
    const tag = new Date(entry.erstellt_am).toLocaleDateString('de-DE', { weekday: 'short' });
    acc[tag] = (acc[tag] || 0) + 1;
    return acc;
  }, {});
  const chartData = Object.entries(aktionenByTag).map(([name, anzahl]) => ({ name, anzahl }));

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">MEINE STATS</h1>
          <p className="page-subtitle">Persönliche Auswertung für {user?.vorname} {user?.nachname}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-burger-500/30 border-t-burger-500 rounded-full animate-spin" /></div>
      ) : (
        <div className="space-y-6">
          {stats && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="stats-card">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-burger-500/10 border border-burger-500/20 flex items-center justify-center"><ShoppingBag size={18} className="text-burger-400" /></div>
                  <div>
                    <div className="stat-label">Bestellungen</div>
                    <div className="stat-value">{stats.bestellungen_gesamt}</div>
                  </div>
                </div>
              </div>
              <div className="stats-card">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center"><TrendingUp size={18} className="text-amber-400" /></div>
                  <div>
                    <div className="stat-label">Umsatz gesamt</div>
                    <div className="stat-value">{parseFloat(stats.umsatz_gesamt || 0).toFixed(2)} €</div>
                  </div>
                </div>
              </div>
              <div className="stats-card">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center"><Clock size={18} className="text-blue-400" /></div>
                  <div>
                    <div className="stat-label">Ø Bestellwert</div>
                    <div className="stat-value">{parseFloat(stats.avg_bestellwert || 0).toFixed(2)} €</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {chartData.length > 0 && (
            <div className="burger-card p-5">
              <h2 className="font-semibold text-white mb-4">Aktivitäten pro Wochentag</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8 }} />
                  <Bar dataKey="anzahl" fill="#C8171E" radius={[4, 4, 0, 0]} name="Aktionen" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {log.length > 0 && (
            <div className="burger-card overflow-x-auto">
              <div className="p-5 border-b border-dark-700"><h2 className="font-semibold text-white">Letzte Aktivitäten</h2></div>
              <table className="data-table">
                <thead><tr><th>Aktion</th><th>Kategorie</th><th>Zeit</th></tr></thead>
                <tbody>
                  {log.map(entry => (
                    <tr key={entry.id}>
                      <td className="text-dark-200">{entry.aktion}</td>
                      <td><span className="badge">{entry.kategorie}</span></td>
                      <td className="text-dark-400 text-xs">{new Date(entry.erstellt_am).toLocaleString('de-DE')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MeineStats;
