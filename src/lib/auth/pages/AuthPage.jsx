import { useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../core/useAuth';
import { AuthTabs } from '../components/AuthTabs';
import PageLoader from "../components/loading";

export default function AuthPage() {
  const { user, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchParams, setSearchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'signin';

  useEffect(() => {
    if (!isLoading && user) {
      if (isAdmin) {
        navigate('/admin', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [user, isAdmin, isLoading, navigate]);

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff'
      }}>
        <div style={{ textAlign: 'center' }}>
          <PageLoader />
          <p style={{
            marginTop: '1rem',
            fontSize: '16px',
            fontWeight: '600',
            color: 'var(--text-primary)',
          }}>
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  const mainContainerStyle = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '4rem',
    background: 'linear-gradient(to right, #e0c3fc, #8ec5fc)',
  };

  const contentWrapperStyle = {
    width: '100%',
    maxWidth: '42rem',
    
  };

  const cardStyle = {
    position: 'relative',
    zIndex: 10,
    backgroundColor: 'var(--mild-accent6)',
    borderRadius: '1rem',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    padding: '2rem',
    backdropFilter: 'blur(4px)',
  };

  const gradientHeaderStyle = {
    fontSize: '1.875rem',
    fontWeight: 700,
    marginBottom: '0.5rem',
    fontFamily: "'Coming Soon', cursive",
    background: 'linear-gradient(to right, #9333ea, #7c3aed)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    color: 'transparent',
  };

  const subHeaderStyle = {
    color: '#6b7280',
    fontSize: '1.125rem',
    fontFamily: "'Coming Soon', cursive",
  };

  const highlightSpanStyle = {
    color: '#9333ea',
    fontWeight: 600,
    fontFamily: "'Coming Soon', cursive",
  };

  const linkStyle = {
    color: '#9333ea',
    fontWeight: 500,
    textDecoration: 'none',
  };

  const legalLinkStyle = {
    fontWeight: 700,
    color: '#4b5563',
    textDecoration: 'none',
  };

  return (
    <div style={mainContainerStyle}>
      <div style={contentWrapperStyle}>
        <div style={{ position: 'relative' }}>
          <div style={cardStyle}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h1 style={gradientHeaderStyle}>
                {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
              </h1>
              <p style={subHeaderStyle}>
                {mode === 'signin' 
                  ? <>Sign in to your account or <span style={highlightSpanStyle}>create a new one</span></>
                  : <>Join our community or <span style={highlightSpanStyle}>sign in to your account</span></>
                }
              </p>
            </div>

            <AuthTabs 
              activeTab={mode} 
              onTabChange={(tab) => setSearchParams({ mode: tab }, { replace: true })} 
            />

            <div style={{
              marginTop: '1.5rem',
              textAlign: 'center',
              fontSize: '0.875rem',
              color: '#6b7280'
            }}>
              <p>
                Need help?{' '}
                <a
                  href="mailto:support@collegeview.com"
                  style={{
                    ...linkStyle,
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                >
                  Contact Support
                </a>
              </p>
            </div>

            <div style={{
              marginTop: '1rem',
              textAlign: 'center',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#6b7280'
            }}>
              <p>
                By signing up, you agree to our{' '}
                <a
                  href="/legal#terms-and-conditions"
                  style={legalLinkStyle}
                  onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                >
                  Terms and Conditions
                </a>,{' '}
                <a
                  href="/legal#refund-policy"
                  style={legalLinkStyle}
                  onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                >
                  Refund Policy
                </a>{' '}
                and{' '}
                <a
                  href="/legal#privacy-policy"
                  style={legalLinkStyle}
                  onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                >
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}