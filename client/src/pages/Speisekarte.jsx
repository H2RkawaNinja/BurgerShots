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

      {/* Page Header */}
      <div className="bg-dark-950 border-b border-dark-800">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <span className="text-xs tracking-[0.4em] text-burger-500 uppercase font-semibold">BurgerShot</span>
          <h1 className="font-display text-6xl tracking-wider mt-1">SPEISEKARTE</h1>
        </div>
        <div className="h-px bg-gradient-to-r from-burger-500 to-transparent" />
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Filter Row */}
        <div className="flex flex-wrap items-center gap-4 mb-8 pb-6 border-b border-dark-800">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-600" />
            <input
              className="bg-dark-800 border border-dark-700 pl-9 pr-4 py-2 text-sm text-white placeholder-dark-700 focus:outline-none focus:border-dark-500 transition-colors w-52"
              placeholder="Suchen..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setActiveKat('')}
              className={`px-4 py-2 text-xs font-semibold tracking-wider uppercase transition-all border ${
                !activeKat
                  ? 'bg-burger-500 border-burger-500 text-white'
                  : 'border-dark-700 text-dark-600 hover:border-dark-600 hover:text-dark-300'
              }`}
            >
              Alle
            </button>
            {kategorien.map(k => (
              <button
                key={k.id}
                onClick={() => setActiveKat(String(k.id))}
                className={`px-4 py-2 text-xs font-semibold tracking-wider uppercase transition-all border flex items-center gap-1.5 ${
                  activeKat === String(k.id)
                    ? 'bg-burger-500 border-burger-500 text-white'
                    : 'border-dark-700 text-dark-600 hover:border-dark-600 hover:text-dark-300'
                }`}
              >
                <span>{k.icon}</span>{k.name}
              </button>
            ))}
          </div>
          {filtered.length > 0 && (
            <span className="text-xs text-dark-700 tracking-wider uppercase ml-auto">
              {filtered.length} Gerichte
            </span>
          )}
        </div>

        {/* Items Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-dark-800">
            {filtered.map(item => (
              <div key={item.id} className="bg-dark-900">
                <MenuItemCard item={item} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <p className="font-display text-3xl text-dark-800 tracking-widest">KEINE GERICHTE GEFUNDEN</p>
            <p className="text-dark-700 text-sm mt-2">Versuche einen anderen Suchbegriff oder Filter.</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Speisekarte;
