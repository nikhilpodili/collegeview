
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import HomePage from '../pages/HomePage';
import CollegesPage from '../pages/CollegesPage';
import CollegeDetailPage from '../pages/CollegeDetailPage';
import ComparePage from '../pages/ComparePage';
import ProfilePage from '../pages/ProfilePage';
import LegalPage from '../pages/LegalPage';
import Footer from '../components/Footer';
import ScrollToTop from '../components/ScrollToTop';
import { AuthProvider } from '../lib/auth/core/AuthProvider';
import AuthPage from '../lib/auth/pages/AuthPage';
import AuthCallbackPage from '../lib/auth/pages/AuthCallbackPage';
import VerifyEmailPage from '../lib/auth/pages/SignupVerifyEmailPage';
import ForgotPasswordPage from '../lib/auth/pages/ForgotPasswordPage';
import NewPasswordPage from '../lib/auth/pages/NewPasswordPage';
import ChangeEmailPage from '../lib/auth/pages/NewEmailInputPage';
import VerifyEmailChangePage from '../lib/auth/pages/VerifyEmailChangePage';
import AdminRoute from '../lib/auth/AdminRoute';
import ProtectedRoute from '../lib/auth/ProtectedRoute';
import { ToastProvider } from '../components/Toast';
import AdminDashboard from '../lib/admin/Page/AdminDashboard';
import { useEffect, useRef } from 'react';
import { useAuth } from '../lib/auth/core/useAuth';
import { useLocation, useNavigate } from 'react-router-dom';

function NotFound() {
  return (
    <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 72, marginBottom: 16 }}>404</div>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 28, color: 'var(--oxford)', marginBottom: 8 }}>Page Not Found</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>The page you're looking for doesn't exist.</p>
        <a href="/" className="btn btn-primary">Go Home</a>
      </div>
    </div>
  );
}

function ProfileCompletionGuard() {
  const { user, profile, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const hasAlerted = useRef(false);

  useEffect(() => {
    if (isLoading || !user) {
      if (!user) hasAlerted.current = false;
      return;
    }
    const isProfilePage = location.pathname === '/profile';
    const isAuthPage = location.pathname.startsWith('/auth');
    if (isProfilePage || isAuthPage) return;
    const isComplete = profile && profile.full_name;

    if (!isComplete) {
      const state = { forceCompletion: true };

      if (!hasAlerted.current) {
        state.message = "Please complete your profile details to continue.";
        hasAlerted.current = true;
      }

      console.log('Profile incomplete or null. Redirecting to completion...');
      navigate('/profile', {
        state,
        replace: true
      });
    }
  }, [user, profile, isLoading, location.pathname, navigate]);

  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <ScrollToTop />
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <ProfileCompletionGuard />
            <Navbar />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/colleges" element={<CollegesPage />} />
                <Route path="/college/:slug" element={<CollegeDetailPage />} />
                <Route path="/rankings" element={<Navigate to="/colleges?sort=nirf_ranking" replace />} />
                <Route path="/compare" element={<ComparePage />} />
                <Route path="/exams" element={<Navigate to="/colleges" replace />} />
                <Route path="/legal" element={<LegalPage />} />

                {/* Auth Routes */}
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/auth/callback" element={<AuthCallbackPage />} />
                <Route path="/auth/verify-email" element={<VerifyEmailPage />} />
                <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/auth/new-password" element={<NewPasswordPage />} />
                <Route path="/auth/verify-email-change" element={<VerifyEmailChangePage />} />

                <Route path="/auth/change-email" element={<ChangeEmailPage />} />

                {/* User Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/profile" element={<ProfilePage />} />
                </Route>

                <Route element={<AdminRoute />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
            <Footer />
          </div>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
