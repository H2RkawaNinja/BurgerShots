import { Link } from 'react-router-dom';

const Header = () => (
  <header className="bg-dark-900/95 backdrop-blur border-b border-dark-700 sticky top-0 z-40">
    <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-3">
        <img src="/logo_wide.webp" alt="BurgerShot" className="h-9 object-contain" />
      </Link>
      <nav className="flex items-center gap-6">
        <Link to="/" className="text-dark-300 hover:text-white transition-colors text-sm font-medium">Home</Link>
        <Link to="/speisekarte" className="text-dark-300 hover:text-white transition-colors text-sm font-medium">Speisekarte</Link>
        <Link to="/admin/login" className="btn-burger py-1.5 px-4 text-sm">Admin</Link>
      </nav>
    </div>
  </header>
);

export default Header;
