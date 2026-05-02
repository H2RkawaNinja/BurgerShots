import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import MenuItemCard from '../components/MenuItemCard';
import api from '../services/api';

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [angebote, setAngebote] = useState([]);

  useEffect(() => {
    api.get('/menu?featured=true').then(r => setFeatured(r.data.slice(0, 3))).catch(() => {});
    api.get('/tagesangebote?aktiv=true').then(r => setAngebote(r.data.slice(0, 3))).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <Header />

      {/* Hero */}
      <section className="overflow-hidden border-b border-dark-800">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-28">
          <div className="grid md:grid-cols-5 gap-8 items-end">
            <div className="md:col-span-3">
              <p className="text-xs tracking-[0.4em] text-burger-500 font-semibold uppercase mb-5">
                Handgemachte Burger
              </p>
              <h1 className="font-display leading-none">
                <span className="block text-8xl md:text-[9rem] text-white tracking-wide">BURGER</span>
                <span className="block text-8xl md:text-[9rem] text-burger-500 tracking-wide -mt-2 md:-mt-3">SHOT</span>
              </h1>
            </div>
            <div className="md:col-span-2 md:pb-4 flex flex-col justify-end">
              <div className="w-8 h-px bg-burger-500 mb-5" />
              <p className="text-dark-400 text-lg leading-relaxed mb-8">
                Keine Fertigware. Keine Abkürzungen.<br />
                <span className="text-white">Echte Burger, täglich frisch.</span>
              </p>
              <Link
                to="/speisekarte"
                className="inline-flex items-center gap-3 bg-burger-500 hover:bg-burger-600 transition-colors text-white font-semibold px-6 py-3 text-sm tracking-widest uppercase w-fit"
              >
                Zur Speisekarte <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-burger-500 to-transparent" />
      </section>

      {/* Info Strip */}
      <section className="bg-dark-950 border-b border-dark-800 py-3">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-wrap items-center text-xs tracking-widest text-dark-600 uppercase">
            {['Frische Zutaten', 'Täglich neue Angebote', 'Vegetarische Optionen', 'Schnelle Zubereitung'].map((t, i, arr) => (
              <span key={i} className={`py-1 pr-6 mr-6 ${i < arr.length - 1 ? 'border-r border-dark-800' : ''}`}>
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Tagesangebote */}
      {angebote.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-14">
          <div className="flex items-end justify-between mb-6 pb-4 border-b border-dark-800">
            <div>
              <span className="text-xs tracking-[0.3em] text-burger-500 uppercase font-semibold">Nur heute</span>
              <h2 className="font-display text-4xl tracking-wider text-white mt-1">TAGESANGEBOTE</h2>
            </div>
          </div>
          <div className="divide-y divide-dark-800">
            {angebote.map(a => (
              <div key={a.id} className="flex items-center gap-6 py-5 group">
                {a.bild ? (
                  <img src={a.bild} alt={a.name} className="w-20 h-20 object-cover shrink-0" />
                ) : (
                  <div className="w-20 h-20 bg-dark-800 shrink-0 flex items-center justify-center text-3xl opacity-30">🍔</div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white text-base">{a.name}</h3>
                  {a.beschreibung && <p className="text-dark-600 text-sm mt-0.5 truncate">{a.beschreibung}</p>}
                </div>
                <div className="shrink-0 text-right">
                  {a.sonderpreis && (
                    <div className="font-display text-2xl text-amber-400 leading-none">{parseFloat(a.sonderpreis).toFixed(2)} €</div>
                  )}
                  {a.rabatt_prozent && (
                    <div className="text-xs text-burger-500 font-bold tracking-wider mt-1">–{a.rabatt_prozent}% RABATT</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Featured Items */}
      {featured.length > 0 && (
        <section className="border-t border-dark-800 py-14">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-end justify-between mb-6 pb-4 border-b border-dark-800">
              <div>
                <span className="text-xs tracking-[0.3em] text-burger-500 uppercase font-semibold">Empfehlungen</span>
                <h2 className="font-display text-4xl tracking-wider text-white mt-1">HIGHLIGHTS</h2>
              </div>
              <Link to="/speisekarte" className="text-xs tracking-widest uppercase text-dark-600 hover:text-white transition-colors flex items-center gap-2">
                Alle ansehen <ArrowRight size={12} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-dark-800">
              {featured.map(item => (
                <div key={item.id} className="bg-dark-900">
                  <MenuItemCard item={item} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default Home;
