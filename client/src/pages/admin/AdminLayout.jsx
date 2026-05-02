import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard, UtensilsCrossed, ShoppingBag, Star,
  Users, Shield, ScrollText,
  LogOut, Menu, X, ChefHat, ClipboardCheck, BookOpen, Globe
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { mitarbeiter, logout, hasPermission } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/admin/login'); };

  const navSections = [
    {
      label: null,
      items: [
        { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true }
      ]
    },
    {
      label: 'Speisekarte',
      items: [
        { to: '/admin/speisekarte', icon: UtensilsCrossed, label: 'Menü-Items', permission: 'speisekarte.ansehen' },
        { to: '/admin/menues', icon: BookOpen, label: 'Menüs', permission: 'speisekarte.ansehen' },
        { to: '/admin/kategorien', icon: ChefHat, label: 'Kategorien', permission: 'speisekarte.erstellen' },
      ]
    },
    {
      label: 'Betrieb',
      items: [
        { to: '/admin/bestellungen', icon: ShoppingBag, label: 'Bestellungen', permission: 'bestellungen.ansehen' },
        { to: '/admin/tagesangebote', icon: Star, label: 'Tagesangebote', permission: 'tagesangebote.verwalten' },
        { to: '/admin/hygiene', icon: ClipboardCheck, label: 'Hygiene', permission: 'hygiene.ansehen' },
      ]
    },
    {
      label: 'Verwaltung',
      items: [
        { to: '/admin/mitarbeiter', icon: Users, label: 'Mitarbeiter', permission: 'mitarbeiter.ansehen' },
        { to: '/admin/rollen', icon: Shield, label: 'Rollen', permission: 'rollen.verwalten' },
        { to: '/admin/log', icon: ScrollText, label: 'Aktivitätslog', permission: 'log.ansehen' },
      ]
    }
  ];

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-5 border-b border-dark-700 flex items-center gap-3">
        <img src="/logo_wide.webp" alt="BurgerShot" className="h-8 object-contain" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {navSections.map((section, si) => {
          const visibleItems = section.items.filter(item => !item.permission || hasPermission(item.permission));
          if (visibleItems.length === 0) return null;
          return (
            <div key={si}>
              {section.label && <p className="sidebar-section">{section.label}</p>}
              {visibleItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <item.icon size={18} />
                  {item.label}
                </NavLink>
              ))}
            </div>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-dark-700">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
            style={{ backgroundColor: mitarbeiter?.rollenFarbe || '#C8171E' }}
          >
            {mitarbeiter?.vorname?.[0]}{mitarbeiter?.nachname?.[0]}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">
              {mitarbeiter?.vorname} {mitarbeiter?.nachname}
            </p>
            <p className="text-dark-400 text-xs truncate">{mitarbeiter?.rolle}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 text-dark-400 hover:text-burger-400 text-sm transition-colors w-full">
          <LogOut size={16} />
          Abmelden
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-dark-900 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex sidebar flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="relative z-50 flex flex-col sidebar h-full">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-dark-700 bg-dark-900">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-dark-300 hover:text-white">
            <Menu size={22} />
          </button>
          <img src="/logo_wide.webp" alt="BurgerShot" className="h-7 object-contain lg:hidden" />
          <div className="hidden lg:block" />
          <Link
            to="/"
            className="flex items-center gap-2 text-xs tracking-widest uppercase font-semibold text-dark-400 hover:text-white border border-dark-700 hover:border-dark-500 px-3 py-1.5 rounded transition-colors"
          >
            <Globe size={14} />
            Kundenbereich
          </Link>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
