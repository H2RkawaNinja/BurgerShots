import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Flame, Users } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import MenuItemCard from '../components/MenuItemCard';
import api from '../services/api';

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [angebote, setAngebote] = useState([]);

  useEffect(() => {
    api.get('/menu?featured=true').then(r => setFeatured(r.data.slice(0, 3))).catch(() => {});
    api.get('/tagesangebote').then(r => setAngebote(r.data.filter(a => a.aktiv).slice(0, 3))).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden py-24 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-burger-500/10 via-transparent to-navy-500/10" />
        <div className="max-w-4xl mx-auto text-center relative">
          <h1 className="font-display text-6xl md:text-8xl tracking-wider mb-6 leading-none">
            <span className="text-white">BURGER</span>
            <span className="text-burger-500">SHOT</span>
          </h1>
          <p className="text-dark-300 text-xl mb-10 max-w-xl mx-auto">
            Handgemachte Burger mit premium Zutaten. Erlebe den Unterschied.
          </p>
          <Link to="/speisekarte" className="btn-burger text-lg px-8 py-3 inline-flex items-center gap-2">
            Zur Speisekarte <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Tagesangebote */}
      {angebote.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex items-center gap-3 mb-6">
            <Star className="text-amber-400" size={24} />
            <h2 className="font-display text-3xl tracking-wider text-white">TAGESANGEBOTE</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {angebote.map(a => (
              <div key={a.id} className="burger-card overflow-hidden">
                {a.bild && <img src={a.bild} alt={a.name} className="w-full h-36 object-cover" />}
                <div className="p-4">
                  <h3 className="font-semibold text-white">{a.name}</h3>
                  <p className="text-dark-400 text-sm mt-1">{a.beschreibung}</p>
                  <div className="flex items-center gap-2 mt-3">
                    {a.rabatt_prozent && <span className="px-2 py-0.5 bg-burger-500/20 text-burger-400 text-sm font-bold rounded-full">-{a.rabatt_prozent}%</span>}
                    {a.sonderpreis && <span className="text-amber-400 font-bold">{parseFloat(a.sonderpreis).toFixed(2)} €</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Featured Items */}
      {featured.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Flame className="text-burger-400" size={24} />
              <h2 className="font-display text-3xl tracking-wider text-white">UNSERE HIGHLIGHTS</h2>
            </div>
            <Link to="/speisekarte" className="btn-burger-outline text-sm px-4 py-2 flex items-center gap-1">
              Alle ansehen <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {featured.map(item => <MenuItemCard key={item.id} item={item} />)}
          </div>
        </section>
      )}

      {/* Stats Banner */}
      <section className="bg-burger-500/10 border-y border-burger-500/20 py-12 px-4 mt-8">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 text-center">
          {[
            { icon: '🍔', label: 'Premium Burger', value: '20+' },
            { icon: '🌿', label: 'Frische Zutaten', value: '100%' },
            { icon: '⚡', label: 'Schnelle Zubereitung', value: '<15min' },
          ].map(s => (
            <div key={s.label}>
              <div className="text-4xl mb-2">{s.icon}</div>
              <div className="font-display text-3xl text-burger-400">{s.value}</div>
              <div className="text-dark-400 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
