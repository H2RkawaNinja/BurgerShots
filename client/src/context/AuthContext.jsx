import { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

const savedToken = localStorage.getItem('token');
if (savedToken) {
  api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth muss innerhalb eines AuthProviders verwendet werden');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [mitarbeiter, setMitarbeiter] = useState(null);
  const [rechte, setRechte] = useState([]);
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const controller = new AbortController();

    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) { setLoading(false); return; }
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      try {
        const res = await api.get('/auth/me', { signal: controller.signal });
        setMitarbeiter(res.data.mitarbeiter);
        setRechte(res.data.rechte || []);
      } catch (error) {
        if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') return;
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
      } finally {
        setLoading(false);
      }
    };

    loadUser();
    return () => controller.abort();
  }, []);

  const setToken = (token) => {
    if (token) {
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
    }
  };

  const login = async (benutzername, passwort) => {
    const res = await api.post('/auth/login', { benutzername, passwort });
    setToken(res.data.token);
    setMitarbeiter(res.data.mitarbeiter);
    setRechte(res.data.rechte || []);
    return res.data;
  };

  const logout = () => {
    setToken(null);
    setMitarbeiter(null);
    setRechte([]);
  };

  const hasPermission = (recht) => rechte.includes(recht);
  const hasAnyPermission = (...list) => list.some(r => rechte.includes(r));

  return (
    <AuthContext.Provider value={{ mitarbeiter, rechte, loading, isAuthenticated: !!mitarbeiter, login, logout, hasPermission, hasAnyPermission }}>
      {children}
    </AuthContext.Provider>
  );
};
