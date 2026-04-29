import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AlertCircle } from 'lucide-react';

const Login = () => {
  const [form, setForm] = useState({ benutzername: '', passwort: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.benutzername, form.passwort);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.error || 'Login fehlgeschlagen.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/logo_wide.webp" alt="BurgerShot" className="h-14 object-contain mx-auto mb-3" />
          <p className="text-dark-400 text-sm">Admin Dashboard</p>
        </div>

        {/* Card */}
        <div className="bg-dark-800 border border-dark-600 rounded-2xl p-6 shadow-card">
          <h1 className="text-xl font-display text-white tracking-wide mb-5">ANMELDEN</h1>

          {error && (
            <div className="alert alert-error mb-4">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label-burger">Benutzername</label>
              <input
                type="text"
                className="input-burger"
                placeholder="benutzername"
                value={form.benutzername}
                onChange={e => setForm(f => ({ ...f, benutzername: e.target.value }))}
                required
                autoComplete="username"
              />
            </div>
            <div>
              <label className="label-burger">Passwort</label>
              <input
                type="password"
                className="input-burger"
                placeholder="••••••••"
                value={form.passwort}
                onChange={e => setForm(f => ({ ...f, passwort: e.target.value }))}
                required
                autoComplete="current-password"
              />
            </div>
            <button type="submit" className="btn-burger w-full mt-2" disabled={loading}>
              {loading ? 'Anmelden...' : 'Anmelden'}
            </button>
          </form>
        </div>

        <p className="text-center text-dark-500 text-xs mt-6">
          BurgerShot © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
};

export default Login;
