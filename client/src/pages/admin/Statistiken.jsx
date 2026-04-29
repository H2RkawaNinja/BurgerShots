import { useEffect, useState } from 'react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import api from '../../services/api';

const COLORS = ['#C8171E', '#E07B27', '#1B3F8B', '#22c55e', '#8b5cf6', '#06b6d4', '#f59e0b'];

const Statistiken = () => {
  const [umsatz, setUmsatz] = useState([]);
  const [topItems, setTopItems] = useState([]);
  const [kategorien, setKategorien] = useState([]);
  const [mitarbeiter, setMitarbeiter] = useState([]);
  const [loading, setLoading] = useState(true);
  const [zeitraum, setZeitraum] = useState('30');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [uRes, topRes, katRes, mitRes] = await Promise.all([
          api.get(`/stats/umsatz?tage=${zeitraum}`),
          api.get('/stats/top-items'),
          api.get('/stats/kategorien'),
          api.get('/stats/mitarbeiter'),
        ]);
        setUmsatz(uRes.data);
        setTopItems(topRes.data);
        setKategorien(katRes.data);
        setMitarbeiter(mitRes.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [zeitraum]);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">STATISTIKEN</h1>
          <p className="page-subtitle">Auswertungen und Trends</p>
        </div>
        <div className="flex gap-2">
          {['7', '30', '90'].map(t => (
            <button key={t} onClick={() => setZeitraum(t)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${zeitraum === t ? 'bg-burger-500 text-white' : 'bg-dark-700 text-dark-300 hover:text-white'}`}>
              {t} Tage
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-burger-500/30 border-t-burger-500 rounded-full animate-spin" /></div>
      ) : (
        <div className="space-y-6">
          {/* Umsatz Chart */}
          {umsatz.length > 0 && (
            <div className="burger-card p-5">
              <h2 className="font-semibold text-white mb-4">Umsatzverlauf</h2>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={umsatz}>
                  <defs>
                    <linearGradient id="umsatzGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C8171E" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#C8171E" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis dataKey="datum" tick={{ fill: '#6b7280', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} tickFormatter={v => `${v}€`} />
                  <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8 }} labelStyle={{ color: '#fff' }} formatter={v => [`${parseFloat(v).toFixed(2)}€`, 'Umsatz']} />
                  <Area type="monotone" dataKey="umsatz" stroke="#C8171E" fill="url(#umsatzGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Items */}
            {topItems.length > 0 && (
              <div className="burger-card p-5">
                <h2 className="font-semibold text-white mb-4">Top Menü-Items</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={topItems.slice(0, 8)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                    <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" width={100} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8 }} />
                    <Bar dataKey="gesamt_menge" fill="#E07B27" radius={[0, 4, 4, 0]} name="Bestellungen" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Kategorien Pie */}
            {kategorien.length > 0 && (
              <div className="burger-card p-5">
                <h2 className="font-semibold text-white mb-4">Umsatz nach Kategorie</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={kategorien} dataKey="umsatz" nameKey="kategorie" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                      {kategorien.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8 }} formatter={v => [`${parseFloat(v).toFixed(2)}€`, 'Umsatz']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Mitarbeiter */}
          {mitarbeiter.length > 0 && (
            <div className="burger-card overflow-x-auto">
              <div className="p-5 border-b border-dark-700">
                <h2 className="font-semibold text-white">Team-Performance</h2>
              </div>
              <table className="data-table">
                <thead>
                  <tr><th>Mitarbeiter</th><th>Bestellungen</th><th>Umsatz gesamt</th><th>Ø Bestellwert</th></tr>
                </thead>
                <tbody>
                  {mitarbeiter.map(m => (
                    <tr key={m.id}>
                      <td className="font-medium text-white">{m.vorname} {m.nachname}</td>
                      <td className="text-dark-300">{m.bestellungen_gesamt}</td>
                      <td className="text-amber-400 font-semibold">{parseFloat(m.umsatz_gesamt || 0).toFixed(2)} €</td>
                      <td className="text-dark-400">{parseFloat(m.avg_bestellwert || 0).toFixed(2)} €</td>
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

export default Statistiken;
