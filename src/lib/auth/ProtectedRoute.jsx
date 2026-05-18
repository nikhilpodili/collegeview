
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './core/useAuth';

export default function ProtectedRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="page-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div className="skeleton" style={{ width: 40, height: 40, borderRadius: '50%' }}></div>
        <p style={{ marginLeft: 12, color: 'var(--text-muted)' }}>Checking session...</p>
      </div>
    );
  }

  if (!user) {
    // Not logged in? Redirect to Login page
    return <Navigate to="/auth" replace />;
  }

  // Logged in? Render child routes
  return <Outlet />;
}
