import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, permission }) => {
  const { isAuthenticated, hasPermission, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-burger-500/30 border-t-burger-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-dark-400 text-sm">Lade...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  if (permission && !hasPermission(permission)) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="text-center">
          <div className="text-5xl mb-4">🚫</div>
          <h2 className="text-xl font-display text-white mb-2">Kein Zugriff</h2>
          <p className="text-dark-400 text-sm">Du hast keine Berechtigung für diese Seite.</p>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
