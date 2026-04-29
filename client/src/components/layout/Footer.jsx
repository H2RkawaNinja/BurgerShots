import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="bg-dark-900 border-t border-dark-700 mt-16">
    <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
      <img src="/logo_wide.webp" alt="BurgerShot" className="h-8 object-contain" />
      <div className="flex gap-6 text-sm text-dark-400">
        <Link to="/" className="hover:text-white transition-colors">Home</Link>
        <Link to="/speisekarte" className="hover:text-white transition-colors">Speisekarte</Link>
        <Link to="/impressum" className="hover:text-white transition-colors">Impressum</Link>
      </div>
      <p className="text-dark-500 text-xs">© {new Date().getFullYear()} BurgerShot. Alle Rechte vorbehalten.</p>
    </div>
  </footer>
);

export default Footer;
