import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import ResendVerification from '../components/ResendVerification';
import { Mail, ExternalLink, AlertCircle, CheckCircle } from 'lucide-react';
import PageLoader from '../components/loading';
import { useAuth } from '../core/useAuth';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get('email') || '';
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
    
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!email) {
      console.warn('No email in URL params, redirecting to auth');
      navigate('/auth');
    }
  }, [email, navigate]);

  const handleSuccess = (successMessage) => {
    setMessage(successMessage);
    setError('');
  };

  const handleError = (errorMessage) => {
    setError(errorMessage);
    setMessage('');
  };

  const styles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--surface)',
      backgroundImage: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-muted) 100%)',
      padding: '48px 16px',
      overflow: 'hidden',
      fontFamily: 'var(--font-ui)',
    },
    card: {
      maxWidth: '480px',
      width: '100%',
      backgroundColor: 'var(--surface-card)',
      padding: '40px',
      borderRadius: 'var(--r-2xl)',
      boxShadow: 'var(--shadow-xl)',
      border: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    },
    header: {
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '12px',
    },
    iconWrapper: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '50%',
      backgroundColor: 'var(--surface-muted)',
      padding: '20px',
      marginBottom: '8px',
    },
    title: {
      fontSize: '26px',
      fontWeight: '700',
      color: 'var(--text-primary)',
      fontFamily: 'var(--font-heading)',
      margin: 0,
    },
    subtitle: {
      fontSize: '15px',
      color: 'var(--text-secondary)',
      lineHeight: '1.6',
      margin: 0,
    },
    emailHighlight: {
      fontWeight: '700',
      color: 'var(--oxford)',
    },
    instructionBox: {
      backgroundColor: 'var(--blue-bg)',
      borderRadius: 'var(--r-lg)',
      padding: '20px',
      border: '1px solid rgba(0, 33, 71, 0.1)',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    },
    instructionTitle: {
      fontSize: '14px',
      fontWeight: '700',
      color: 'var(--oxford)',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      margin: 0,
    },
    instructionList: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
    },
    instructionItem: {
      fontSize: '13px',
      color: 'var(--oxford)',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '10px',
      lineHeight: '1.4',
    },
    statusBox: (type) => ({
      padding: '16px',
      borderRadius: 'var(--r-lg)',
      backgroundColor: type === 'success' ? 'var(--green-bg)' : 'var(--red-bg)',
      border: `1px solid ${type === 'success' ? 'rgba(21, 128, 61, 0.2)' : 'rgba(185, 28, 28, 0.2)'}`,
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
    }),
    btnOutline: {
      width: '100%',
      padding: '12px 24px',
      backgroundColor: 'transparent',
      border: '1.5px solid var(--border)',
      color: 'var(--text-secondary)',
      borderRadius: 'var(--r-lg)',
      fontSize: '15px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
    },
    footer: {
      paddingTop: '20px',
      borderTop: '1px solid var(--border)',
      textAlign: 'center',
    },
    backLink: {
      fontSize: '14px',
      color: 'var(--oxford)',
      fontWeight: '600',
      textDecoration: 'none',
      transition: 'color 0.2s',
    }
  };

  if (!email) {
    return <div style={styles.container}><PageLoader /></div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.iconWrapper}>
            <Mail size={32} color="var(--oxford)" />
          </div>
          <h2 style={styles.title}>Check Your Email</h2>
          <p style={styles.subtitle}>
            We've sent your verification email to{' '}
            <span style={styles.emailHighlight}>{email}</span>
          </p>
        </div>

        <div style={styles.instructionBox}>
          <h3 style={styles.instructionTitle}>
            <Mail size={16} />
            Complete Your Registration
          </h3>
          <div style={styles.instructionList}>
            <div style={styles.instructionItem}>
              <span style={{ fontWeight: '700' }}>1.</span>
              <span>Open your email inbox and find our message.</span>
            </div>
            <div style={styles.instructionItem}>
              <span style={{ fontWeight: '700' }}>2.</span>
              <span>Click the verification link to activate your account.</span>
            </div>
          </div>
        </div>

        {message && (
          <div style={styles.statusBox('success')}>
            <CheckCircle size={20} color="var(--green)" style={{ marginTop: '2px' }} />
            <p style={{ fontSize: '13px', color: 'var(--green)', margin: 0 }}>{message}</p>
          </div>
        )}

        {error && (
          <div style={styles.statusBox('error')}>
            <AlertCircle size={20} color="var(--red)" style={{ marginTop: '2px' }} />
            <p style={{ fontSize: '13px', color: 'var(--red)', margin: 0 }}>{error}</p>
          </div>
        )}

        <ResendVerification
          email={email}
          onSuccess={handleSuccess}
          onError={handleError}
        />

        <button
          onClick={() => window.open(`mailto:${email}`, '_blank')}
          style={styles.btnOutline}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--surface-muted)';
            e.currentTarget.style.borderColor = 'var(--oxford)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.borderColor = 'var(--border)';
          }}
        >
          <ExternalLink size={18} />
          <span>Open Mail App</span>
        </button>

        <div style={styles.footer}>
          <Link
            to="/auth"
            style={styles.backLink}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--oxford-light)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--oxford)'}
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
