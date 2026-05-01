import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const { pathname } = useLocation();
  return (
    <>
      <div className="h-0.5 bg-burger-500" />
      <header className="bg-dark-950/98 backdrop-blur border-b border-dark-800 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img src="/logo_wide.webp" alt="BurgerShot" className="h-8 object-contain" />
          </Link>
          <nav className="flex items-center gap-8">
            <Link
              to="/"
              className={`text-xs font-semibold tracking-widest uppercase transition-colors ${pathname === '/' ? 'text-white' : 'text-dark-500 hover:text-dark-200'}`}
            >
              Home
            </Link>
            <Link
              to="/speisekarte"
              className={`text-xs font-semibold tracking-widest uppercase transition-colors ${pathname === '/speisekarte' ? 'text-white' : 'text-dark-500 hover:text-dark-200'}`}
            >
              Speisekarte
            </Link>
            <Link
              to="/admin/login"
              className="text-xs font-medium tracking-widest uppercase text-dark-700 hover:text-dark-500 transition-colors"
            >
              Admin
            </Link>
          </nav>
        </div>
      </header>
    </>
  );
};

export default Header;
