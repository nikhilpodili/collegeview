
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './core/useAuth';

export default function AdminRoute() {
    const { user, isAdmin, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="page-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <div className="skeleton" style={{ width: 40, height: 40, borderRadius: '50%' }}></div>
                <p style={{ marginLeft: 12, color: 'var(--text-muted)' }}>Verifying admin access...</p>
            </div>
        );
    }

    if (!user) {
        // Not logged in Redirect to Auth page
        return <Navigate to="/auth" replace />;
    }

    if (!isAdmin) {
        // Logged in but NOT admin Redirect to Home
        console.warn(`Unauthorized admin access attempt by ${user.email}`);
        return <Navigate to="/" replace />;
    }

    // Is Admin Render the child routes (Outlet)
    return <Outlet />;
}