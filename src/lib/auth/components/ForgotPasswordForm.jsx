import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Mail, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { supabase } from '../../hooks/supabase';
import { forgotPasswordSchema } from './validation';

export default function ForgotPasswordForm({
  onSuccess,
  onBackToSignIn,
}) {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/new-password`,
      });

      if (error) {
        setSubmitError(error.message || 'Failed to send reset email');
        return;
      }

      sessionStorage.setItem('resetEmail', data.email);
      setSubmitSuccess('Verification Link sent! Redirecting...');

      onSuccess?.();

      setTimeout(() => {
        navigate('/auth/', { replace: true });
      }, 1500);

    } catch (err) {
      console.error('Forgot password error:', err);
      setSubmitError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };



  const styles = {
    container: {
      backgroundColor: 'var(--surface-card)',
      borderRadius: 'var(--r-2xl)',
      boxShadow: 'var(--shadow-xl)',
      border: '1px solid var(--border)',
      padding: '2rem', 
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
      maxWidth: '480px',
      margin: '0 auto',
      fontFamily: 'var(--font-ui)',
    },
    headerContainer: {
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
    },
    iconWrapper: {
      width: '64px',
      height: '64px',
      background: 'linear-gradient(135deg, var(--surface-muted) 0%, #e2e8f0 100%)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto',
    },
    title: {
      fontFamily: 'var(--font-heading)',
      fontSize: 'clamp(22px, 3vw, 24px)',
      fontWeight: 700,
      color: 'var(--text-primary)',
      margin: 0,
    },
    subtitle: {
      fontSize: '15px',
      lineHeight: 1.6,
      color: 'var(--text-secondary)',
      margin: 0,
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    },
    label: {
      fontSize: '14px',
      fontWeight: 600,
      color: 'var(--text-primary)',
    },
    inputWrapper: {
      position: 'relative',
    },
    inputIcon: {
      position: 'absolute',
      left: '14px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: 'var(--text-muted)',
      pointerEvents: 'none',
    },
    input: (hasError) => ({
      width: '100%',
      paddingLeft: '48px', 
      paddingRight: '14px',
      height: '48px',
      border: `1.5px solid ${hasError ? 'var(--red)' : 'var(--border)'}`,
      borderRadius: 'var(--r-lg)', 
      fontSize: '14px',
      fontFamily: 'var(--font-ui)',
      color: 'var(--text-primary)',
      backgroundColor: 'var(--surface-card)',
      outline: 'none',
      transition: 'all 0.18s ease',
      boxShadow: hasError ? '0 0 0 3px rgba(185, 28, 28, 0.1)' : 'none',
    }),
    inputFocus: {
      borderColor: 'var(--oxford)',
      boxShadow: '0 0 0 3px rgba(0, 33, 71, 0.08)',
    },
    errorMessage: {
      fontSize: '13px',
      color: 'var(--red)',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      marginTop: '4px',
    },
    successBox: {
      padding: '16px',
      borderRadius: 'var(--r-lg)',
      backgroundColor: 'var(--green-bg)',
      border: '1px solid rgba(21, 128, 61, 0.2)',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
    },
    errorBox: {
      padding: '16px',
      borderRadius: 'var(--r-lg)',
      backgroundColor: 'var(--red-bg)',
      border: '1px solid rgba(185, 28, 28, 0.2)',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
    },
    statusTextPrimary: {
      fontSize: '14px',
      fontWeight: 700,
      marginBottom: '4px',
    },
    statusTextSecondary: {
      fontSize: '13px',
      lineHeight: 1.5,
    },
    btnPrimary: (disabled) => ({
      width: '100%',
      height: '48px',
      padding: '0 28px',
      backgroundColor: disabled ? 'var(--surface-muted)' : 'var(--oxford)',
      color: disabled ? 'var(--text-muted)' : '#fff',
      borderRadius: 'var(--r-md)',
      border: 'none',
      fontSize: '15px',
      fontWeight: 600,
      fontFamily: 'var(--font-ui)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.7 : 1,
      transition: 'all 0.18s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      boxShadow: disabled ? 'none' : 'var(--shadow-sm)',
    }),
    btnOutline: {
      width: '100%',
      height: '48px',
      padding: '0 28px',
      backgroundColor: 'transparent',
      border: '1.5px solid var(--border)',
      color: 'var(--text-secondary)',
      borderRadius: 'var(--r-lg)',
      fontSize: '15px',
      fontWeight: 600,
      fontFamily: 'var(--font-ui)',
      cursor: 'pointer',
      transition: 'all 0.18s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
    },
    footerNote: {
      paddingTop: '16px',
      borderTop: '1px solid var(--border)',
      fontSize: '12px',
      color: 'var(--text-muted)',
      textAlign: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
    },
  };

  return (
    <div style={styles.container}>

      <div style={styles.headerContainer}>
        <div style={styles.iconWrapper}>
          <Mail size={32} color="var(--oxford-light)" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h2 style={styles.title}>Forgot Password?</h2>
          <p style={styles.subtitle}>
            No worries! Enter your email and we'll send you a verification code to reset your password.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} style={styles.form}>

        <div style={styles.inputGroup}>
          <label htmlFor="email" style={styles.label}>
            Email Address
          </label>
          <div style={styles.inputWrapper}>
            <div style={styles.inputIcon}>
              <Mail size={20} />
            </div>
            <input
              id="email"
              type="email"
              placeholder="Enter your email address"
              style={styles.input(!!errors.email)}
              {...register('email')}
              disabled={isSubmitting}
              autoComplete="email"
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--oxford)';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 33, 71, 0.08)';
              }}
              onBlur={(e) => {
                if (!errors.email) {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            />
          </div>
          {errors.email && (
            <div style={styles.errorMessage}>
              <AlertCircle size={16} />
              <span>{errors.email.message}</span>
            </div>
          )}
        </div>

        {submitSuccess && (
          <div style={styles.successBox}>
            <CheckCircle size={20} color="var(--green)" style={{ marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
              <p style={{ ...styles.statusTextPrimary, color: 'var(--green)' }}>Success!</p>
              <p style={{ ...styles.statusTextSecondary, color: 'var(--green)' }}>{submitSuccess}</p>
            </div>
          </div>
        )}

        {submitError && (
          <div style={styles.errorBox}>
            <AlertCircle size={20} color="var(--red)" style={{ marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
              <p style={{ ...styles.statusTextPrimary, color: 'var(--red)' }}>Error</p>
              <p style={{ ...styles.statusTextSecondary, color: 'var(--red)' }}>{submitError}</p>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !isValid}
          style={styles.btnPrimary(isSubmitting || !isValid)}
          onMouseEnter={(e) => {
            if (!isSubmitting && isValid) {
              e.currentTarget.style.backgroundColor = 'var(--oxford-light)';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isSubmitting && isValid) {
              e.currentTarget.style.backgroundColor = 'var(--oxford)';
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            }
          }}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} height="20" width="20" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Sending Link...</span>
            </>
          ) : (
            <>
              <Mail size={20} />
              <span>Send Verification Link</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            if (onBackToSignIn) {
              onBackToSignIn();
            } else {
              navigate('/auth');
            }
          }}
          style={styles.btnOutline}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--oxford)';
            e.currentTarget.style.color = 'var(--oxford)';
            e.currentTarget.style.backgroundColor = 'var(--blue-bg)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.color = 'var(--text-secondary)';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <ArrowLeft size={18} />
          <span>Back to Sign In</span>
        </button>
      </form>

      <div style={styles.footerNote}>
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <span>Your password reset is secure and encrypted</span>
      </div>
    </div>
  );
}