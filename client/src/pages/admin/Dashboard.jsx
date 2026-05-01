import { useEffect, useState } from 'react';
import { ShoppingBag, UtensilsCrossed, Users, AlertCircle, Clock } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const StatCard = ({ icon: Icon, label, value, sub, color = 'burger' }) => {
  const colorMap = {
    burger: 'text-burger-400 bg-burger-500/10 border-burger-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    navy: 'text-blue-400 bg-navy-500/10 border-navy-500/20',
    green: 'text-green-400 bg-green-500/10 border-green-500/20',
  };
  return (
    <div className="stats-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="stat-label">{label}</p>
          <p className="stat-value mt-1">{value}</p>
          {sub && <p className="text-xs text-dark-400 mt-1">{sub}</p>}
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${colorMap[color]}`}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { hasPermission } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, ordersRes] = await Promise.all([
          hasPermission('dashboard.stats') ? api.get('/stats') : Promise.resolve({ data: null }),
          hasPermission('bestellungen.ansehen') ? api.get('/bestellungen?limit=5') : Promise.resolve({ data: [] })
        ]);
        setStats(statsRes.data);
        setRecentOrders(Array.isArray(ordersRes.data) ? ordersRes.data.slice(0, 5) : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const statusLabel = {
    offen: { label: 'Offen', cls: 'badge-open' },
    zubereitung: { label: 'In Zubereitung', cls: 'badge-preparing' },
    fertig: { label: 'Fertig', cls: 'badge-ready' },
    abgeholt: { label: 'Abgeholt', cls: 'badge-picked-up' },
    storniert: { label: 'Storniert', cls: 'badge-cancelled' }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-burger-500/30 border-t-burger-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">DASHBOARD</h1>
          <p className="page-subtitle">Willkommen zurück! Hier ist deine Übersicht.</p>
        </div>
        <span className="text-dark-400 text-sm">{new Date().toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long' })}</span>
      </div>

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={ShoppingBag} label="Bestellungen heute" value={stats.bestellungenHeute} color="burger" />
          <StatCard icon={AlertCircle} label="Offene Bestellungen" value={stats.offeneBestellungen} color="burger" />
          <StatCard icon={UtensilsCrossed} label="Menü-Items" value={stats.menuItemsGesamt} color="navy" />
          <StatCard icon={Users} label="Team" value={stats.teamGesamt} color="navy" />
        </div>
      )}

      {recentOrders.length > 0 && (
        <div className="burger-card">
          <div className="flex items-center gap-3 p-5 border-b border-dark-700">
            <Clock size={18} className="text-burger-400" />
            <h2 className="font-semibold text-white">Letzte Bestellungen</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Bestellnummer</th>
                  <th>Status</th>
                  <th>Betrag</th>
                  <th>Tisch</th>
                  <th>Uhrzeit</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(b => {
                  const st = statusLabel[b.status] || { label: b.status, cls: 'badge' };
                  return (
                    <tr key={b.id}>
                      <td className="font-mono text-sm text-dark-200">{b.bestellnummer}</td>
                      <td><span className={`badge ${st.cls}`}>{st.label}</span></td>
                      <td className="text-amber-400 font-semibold">{parseFloat(b.gesamtbetrag).toFixed(2)} €</td>
                      <td className="text-dark-300">{b.tisch_nr || '—'}</td>
                      <td className="text-dark-400 text-xs">
                        {new Date(b.erstellt_am).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
