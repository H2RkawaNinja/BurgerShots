import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="mt-24 border-t-2 border-burger-500">
    <div className="bg-dark-950">
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-3 gap-10">
        <div>
          <img src="/logo_wide.webp" alt="BurgerShot" className="h-8 object-contain mb-4" />
          <p className="text-dark-600 text-sm leading-relaxed">
            Handgemachte Burger.<br />
            Täglich frisch zubereitet.<br />
            Keine Kompromisse.
          </p>
        </div>
        <div>
          <h4 className="font-display tracking-widest text-xs text-dark-400 uppercase mb-4">Navigation</h4>
          <div className="flex flex-col gap-2.5">
            <Link to="/" className="text-dark-600 hover:text-white transition-colors text-sm">Home</Link>
            <Link to="/speisekarte" className="text-dark-600 hover:text-white transition-colors text-sm">Speisekarte</Link>
            <Link to="/impressum" className="text-dark-600 hover:text-white transition-colors text-sm">Impressum</Link>
          </div>
        </div>

      </div>
      <div className="border-t border-dark-900 px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <p className="text-dark-800 text-xs tracking-wider">© {new Date().getFullYear()} BURGERSHOT</p>
          <Link to="/impressum" className="text-dark-800 hover:text-dark-500 text-xs tracking-wider uppercase transition-colors">Impressum</Link>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
