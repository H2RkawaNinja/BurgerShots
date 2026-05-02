import { Flame, Leaf } from 'lucide-react';

const MenuItemCard = ({ item }) => (
  <div className="group overflow-hidden h-full">
    <div className="relative h-48 overflow-hidden bg-dark-800">
      {item.bild ? (
        <img
          src={item.bild}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-6xl opacity-10">{item.kategorie?.icon || '🍔'}</span>
        </div>
      )}
      {!item.verfuegbar && (
        <div className="absolute inset-0 bg-dark-900/80 flex items-center justify-center">
          <span className="text-dark-500 font-semibold text-xs tracking-widest uppercase">Nicht verfügbar</span>
        </div>
      )}
      <div className="absolute top-0 left-0 flex">
        {item.neu && (
          <span className="bg-navy-500 text-white text-xs font-bold px-2 py-1 tracking-wider">NEU</span>
        )}
        {item.beliebt && (
          <span className="bg-amber-500 text-white text-xs font-bold px-2 py-1 tracking-wider">BELIEBT</span>
        )}
      </div>
    </div>
    <div className="p-4 bg-dark-900">
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <h3 className="font-medium text-white text-sm leading-snug">{item.name}</h3>
        <span className="font-display text-xl text-amber-400 shrink-0 leading-none tabular-nums">
          ${parseFloat(item.preis).toFixed(2)}
        </span>
      </div>
      {item.beschreibung && (
        <p className="text-dark-600 text-xs line-clamp-2 leading-relaxed">{item.beschreibung}</p>
      )}
      {(item.kalorien || item.vegetarisch || item.scharf) && (
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-dark-800 text-xs text-dark-700">
          {item.kalorien && (
            <span className="flex items-center gap-1"><Flame size={10} /> {item.kalorien} kcal</span>
          )}
          {item.vegetarisch && (
            <span className="flex items-center gap-1 text-green-800"><Leaf size={10} /> Vegetarisch</span>
          )}
          {item.scharf && <span>🌶</span>}
        </div>
      )}
    </div>
  </div>
);

export default MenuItemCard;
