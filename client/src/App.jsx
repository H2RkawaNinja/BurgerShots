import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Public pages
import Home from './pages/Home';
import Speisekarte from './pages/Speisekarte';
import Impressum from './pages/Impressum';

// Admin auth
import Login from './pages/admin/Login';

// Admin layout
import AdminLayout from './pages/admin/AdminLayout';

// Admin pages
import Dashboard from './pages/admin/Dashboard';
import SpeisekarteVerwalten from './pages/admin/SpeisekarteVerwalten';
import Kategorien from './pages/admin/Kategorien';
import Bestellungen from './pages/admin/Bestellungen';
import Tagesangebote from './pages/admin/Tagesangebote';
import Lagerbestand from './pages/admin/Lagerbestand';
import Statistiken from './pages/admin/Statistiken';
import Mitarbeiter from './pages/admin/Mitarbeiter';
import Rollen from './pages/admin/Rollen';
import MeineStats from './pages/admin/MeineStats';
import Aktivitaetslog from './pages/admin/Aktivitaetslog';
import Hygiene from './pages/admin/Hygiene';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/speisekarte" element={<Speisekarte />} />
          <Route path="/impressum" element={<Impressum />} />

          {/* Admin auth */}
          <Route path="/admin/login" element={<Login />} />

          {/* Admin (protected) */}
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="speisekarte" element={
              <ProtectedRoute permission="speisekarte.ansehen">
                <SpeisekarteVerwalten />
              </ProtectedRoute>
            } />
            <Route path="kategorien" element={
              <ProtectedRoute permission="speisekarte.erstellen">
                <Kategorien />
              </ProtectedRoute>
            } />
            <Route path="bestellungen" element={
              <ProtectedRoute permission="bestellungen.ansehen">
                <Bestellungen />
              </ProtectedRoute>
            } />
            <Route path="tagesangebote" element={
              <ProtectedRoute permission="tagesangebote.verwalten">
                <Tagesangebote />
              </ProtectedRoute>
            } />
            <Route path="lagerbestand" element={
              <ProtectedRoute permission="lagerbestand.ansehen">
                <Lagerbestand />
              </ProtectedRoute>
            } />
            <Route path="hygiene" element={
              <ProtectedRoute permission="hygiene.ansehen">
                <Hygiene />
              </ProtectedRoute>
            } />
            <Route path="statistiken" element={
              <ProtectedRoute permission="statistiken.ansehen">
                <Statistiken />
              </ProtectedRoute>
            } />
            <Route path="mitarbeiter" element={
              <ProtectedRoute permission="mitarbeiter.ansehen">
                <Mitarbeiter />
              </ProtectedRoute>
            } />
            <Route path="rollen" element={
              <ProtectedRoute permission="rollen.verwalten">
                <Rollen />
              </ProtectedRoute>
            } />
            <Route path="meine-stats" element={<MeineStats />} />
            <Route path="log" element={
              <ProtectedRoute permission="log.ansehen">
                <Aktivitaetslog />
              </ProtectedRoute>
            } />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
