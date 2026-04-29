import { Flame, Leaf, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

const MenuItemCard = ({ item }) => (
  <div className="burger-card overflow-hidden group hover:border-burger-500/40 transition-all duration-300">
    <div className="relative h-44 overflow-hidden">
      {item.bild ? (
        <img src={item.bild} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      ) : (
        <div className="w-full h-full bg-dark-700 flex items-center justify-center text-5xl">
          {item.kategorie?.icon || '🍔'}
        </div>
      )}
      {!item.verfuegbar && (
        <div className="absolute inset-0 bg-dark-900/70 flex items-center justify-center">
          <span className="text-white font-semibold text-sm bg-burger-500/80 px-3 py-1 rounded-full">Nicht verfügbar</span>
        </div>
      )}
      <div className="absolute top-2 left-2 flex gap-1">
        {item.neu && <span className="px-1.5 py-0.5 bg-navy-500 text-white text-xs font-bold rounded">NEU</span>}
        {item.beliebt && <span className="px-1.5 py-0.5 bg-amber-500 text-white text-xs font-bold rounded">★ Beliebt</span>}
      </div>
    </div>
    <div className="p-4">
      <div className="flex items-start justify-between gap-2 mb-1">
        <h3 className="font-semibold text-white text-base leading-tight">{item.name}</h3>
        <span className="text-amber-400 font-bold text-lg shrink-0">{parseFloat(item.preis).toFixed(2)} €</span>
      </div>
      {item.beschreibung && <p className="text-dark-400 text-sm line-clamp-2 mb-3">{item.beschreibung}</p>}
      <div className="flex items-center gap-3 text-xs text-dark-500">
        {item.kalorien && <span className="flex items-center gap-1"><Flame size={11} /> {item.kalorien} kcal</span>}
        {item.vegetarisch && <span className="flex items-center gap-1 text-green-400"><Leaf size={11} /> Vegetarisch</span>}
        {item.scharf && <span className="text-burger-400">🌶</span>}
      </div>
    </div>
  </div>
);

export default MenuItemCard;
