import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import MenuItemCard from '../components/MenuItemCard';
import api from '../services/api';

const Speisekarte = () => {
  const [items, setItems] = useState([]);
  const [kategorien, setKategorien] = useState([]);
  const [activeKat, setActiveKat] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    Promise.all([api.get('/menu'), api.get('/kategorien')]).then(([mRes, kRes]) => {
      setItems(mRes.data.filter(i => i.verfuegbar));
      setKategorien(kRes.data.filter(k => k.aktiv));
    }).catch(() => {});
  }, []);

  const filtered = items.filter(i =>
    (!activeKat || String(i.kategorie_id) === activeKat) &&
    (!search || i.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="font-display text-5xl tracking-wider mb-2">SPEISEKARTE</h1>
          <p className="text-dark-400">Alle Gerichte frisch zubereitet</p>
        </div>

        {/* Search */}
        <div className="relative max-w-sm mb-6">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" />
          <input className="input-burger pl-9" placeholder="Suchen..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Kategorie Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button onClick={() => setActiveKat('')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${!activeKat ? 'bg-burger-500 text-white shadow-red' : 'bg-dark-700 text-dark-300 hover:text-white'}`}>
            Alle
          </button>
          {kategorien.map(k => (
            <button key={k.id} onClick={() => setActiveKat(String(k.id))}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${activeKat === String(k.id) ? 'bg-burger-500 text-white shadow-red' : 'bg-dark-700 text-dark-300 hover:text-white'}`}>
              {k.icon} {k.name}
            </button>
          ))}
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(item => <MenuItemCard key={item.id} item={item} />)}
          {filtered.length === 0 && (
            <div className="col-span-4 text-center text-dark-400 py-16">Keine Gerichte gefunden.</div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Speisekarte;
