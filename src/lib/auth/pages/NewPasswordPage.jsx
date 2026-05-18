import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, AlertCircle, CheckCircle, Key, Lock } from 'lucide-react';
import { newPasswordSchema } from '../components/validation';
import { supabase } from '../../hooks/supabase';
import { useAuth } from '../core/useAuth';

export default function NewPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [submitMessage, setSubmitMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const email = sessionStorage.getItem('resetEmail') || '';

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(newPasswordSchema),
    mode: 'onBlur',
  });

  const password = watch('password');
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate('/auth/forgot-password');
      }
    };
    checkSession();
  }, [navigate]);

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === 'confirmPassword' && value.confirmPassword) {
        setConfirmPasswordTouched(true);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const getPasswordStrength = (pwd) => {
    if (!pwd) return null;
    if (pwd.length < 8)
      return { label: 'Weak', color: 'var(--red)', width: '33.33%' };
    const hasLetter = /[a-zA-Z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    if (hasLetter && hasNumber)
      return { label: 'Strong', color: 'var(--green)', width: '100%' };
    return { label: 'Medium', color: 'var(--saffron)', width: '66.66%' };
  };

  const strength = password ? getPasswordStrength(password) : null;

  const onSubmit = async (data) => {
    setIsLoading(true);
    setSubmitMessage(null);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (updateError) {
        setSubmitMessage({
          type: 'error',
          text: updateError.message || 'Failed to update password.',
        });
        return;
      }

      await supabase.auth.signOut();
      sessionStorage.removeItem('isPasswordReset');

      setSubmitMessage({
        type: 'success',
        text: 'Password updated successfully! Redirecting to login...',
      });

      reset();

      setTimeout(() => {
        navigate('/auth?tab=signin&message=password-updated');
      }, 2000);
    } catch (err) {
      setSubmitMessage({
        type: 'error',
        text: err.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
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
      gap: '32px',
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
      fontWeight: '500',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    },
    label: {
      fontSize: '14px',
      fontWeight: '600',
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
      padding: '12px 48px 12px 44px',
      border: `1.5px solid ${hasError ? 'var(--red)' : 'var(--border)'}`,
      borderRadius: 'var(--r-lg)',
      fontSize: '14px',
      transition: 'all 0.2s ease',
      outline: 'none',
      backgroundColor: 'var(--surface-card)',
      color: 'var(--text-primary)',
    }),
    toggleBtn: {
      position: 'absolute',
      right: '14px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: 'var(--text-muted)',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'color 0.2s',
    },
    strengthBar: {
      height: '6px',
      width: '100%',
      backgroundColor: 'var(--border)',
      borderRadius: '3px',
      overflow: 'hidden',
      marginTop: '8px',
    },
    strengthIndicator: (width, color) => ({
      height: '100%',
      width: width,
      backgroundColor: color,
      transition: 'all 0.4s ease',
    }),
    requirementList: {
      backgroundColor: 'var(--surface-muted)',
      borderRadius: 'var(--r-lg)',
      padding: '16px',
      marginTop: '12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
    },
    requirementItem: (met) => ({
      fontSize: '13px',
      color: met ? 'var(--green)' : 'var(--text-muted)',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontWeight: met ? '600' : '400',
    }),
    statusBox: (type) => ({
      padding: '16px',
      borderRadius: 'var(--r-lg)',
      backgroundColor: type === 'success' ? 'var(--green-bg)' : 'var(--red-bg)',
      border: `1px solid ${type === 'success' ? 'rgba(21, 128, 61, 0.2)' : 'rgba(185, 28, 28, 0.2)'}`,
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
    }),
    btnPrimary: (disabled) => ({
      width: '100%',
      padding: '14px 24px',
      backgroundColor: disabled ? 'var(--surface-muted)' : 'var(--oxford)',
      color: disabled ? 'var(--text-muted)' : '#fff',
      borderRadius: 'var(--r-lg)',
      border: 'none',
      fontSize: '15px',
      fontWeight: '600',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      boxShadow: disabled ? 'none' : 'var(--shadow-md)',
    }),
    footer: {
      marginTop: '24px',
      textAlign: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      color: 'var(--text-muted)',
      fontSize: '13px',
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.iconWrapper}>
            <Lock size={32} color="var(--oxford)" />
          </div>
          <h2 style={styles.title}>Create New Password</h2>
          <p style={styles.subtitle}>
            Your new password must be different from previously used passwords.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate style={styles.form}>
          <input
            type="email"
            name="username"
            autoComplete="new-password"
            value={email || ''}
            readOnly
            style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }}
          />

          {submitMessage && (
            <div style={styles.statusBox(submitMessage.type)}>
              {submitMessage.type === 'success' ? (
                <CheckCircle size={20} color="var(--green)" style={{ marginTop: '2px' }} />
              ) : (
                <AlertCircle size={20} color="var(--red)" style={{ marginTop: '2px' }} />
              )}
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '14px', fontWeight: '700', color: submitMessage.type === 'success' ? 'var(--green)' : 'var(--red)', margin: '0 0 4px 0' }}>
                  {submitMessage.type === 'success' ? 'Success!' : 'Error'}
                </p>
                <p style={{ fontSize: '13px', lineHeight: '1.5', color: submitMessage.type === 'success' ? 'var(--green)' : 'var(--red)', margin: 0 }}>
                  {submitMessage.text}
                </p>
              </div>
            </div>
          )}


          <div style={styles.inputGroup}>
            <label htmlFor="password" style={styles.label}>New Password</label>
            <div style={styles.inputWrapper}>
              <div style={styles.inputIcon}><Lock size={18} /></div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your new password"
                style={styles.input(!!errors.password)}
                {...register('password')}
                disabled={isLoading}
                autoComplete="new-password"
                onFocus={(e) => {
                  if (!errors.password) {
                    e.currentTarget.style.borderColor = 'var(--oxford)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 33, 71, 0.08)';
                  }
                }}
                onBlur={(e) => {
                  if (!errors.password) {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              />
              <button
                type="button"
                style={styles.toggleBtn}
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {strength && password && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginTop: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Strength:</span>
                  <span style={{ fontWeight: '700', color: strength.color }}>{strength.label}</span>
                </div>
                <div style={styles.strengthBar}>
                  <div style={styles.strengthIndicator(strength.width, strength.color)} />
                </div>
              </div>
            )}

            {password && (
              <div style={styles.requirementList}>
                <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 8px 0' }}>Requirements:</p>
                <div style={styles.requirementItem(password.length >= 8)}>
                  {password.length >= 8 ? <CheckCircle size={14} /> : <div style={{ width: 14, height: 14, borderRadius: '50%', border: '1px solid var(--border)' }} />}
                  At least 8 characters
                </div>
                <div style={styles.requirementItem(/[A-Z]/.test(password))}>
                  {/[A-Z]/.test(password) ? <CheckCircle size={14} /> : <div style={{ width: 14, height: 14, borderRadius: '50%', border: '1px solid var(--border)' }} />}
                  One uppercase letter
                </div>
                <div style={styles.requirementItem(/[0-9]/.test(password))}>
                  {/[0-9]/.test(password) ? <CheckCircle size={14} /> : <div style={{ width: 14, height: 14, borderRadius: '50%', border: '1px solid var(--border)' }} />}
                  One number
                </div>
              </div>
            )}

            {errors.password && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--red)', fontSize: '12px', marginTop: '6px' }}>
                <AlertCircle size={14} />
                <span>{errors.password.message}</span>
              </div>
            )}
          </div>

     
          <div style={styles.inputGroup}>
            <label htmlFor="confirmPassword" style={styles.label}>Confirm Password</label>
            <div style={styles.inputWrapper}>
              <div style={styles.inputIcon}><Lock size={18} /></div>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Re-enter your password"
                style={styles.input(!!errors.confirmPassword && confirmPasswordTouched)}
                {...register('confirmPassword')}
                disabled={isLoading}
                onFocus={(e) => {
                  if (!(errors.confirmPassword && confirmPasswordTouched)) {
                    e.currentTarget.style.borderColor = 'var(--oxford)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 33, 71, 0.08)';
                  }
                }}
                onBlur={(e) => {
                  if (!(errors.confirmPassword && confirmPasswordTouched)) {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              />
              <button
                type="button"
                style={styles.toggleBtn}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && confirmPasswordTouched && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--red)', fontSize: '12px', marginTop: '6px' }}>
                <AlertCircle size={14} />
                <span>{errors.confirmPassword.message}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={styles.btnPrimary(isLoading)}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = 'var(--oxford-light)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = 'var(--oxford)';
                e.currentTarget.style.transform = 'none';
              }
            }}
          >
            {isLoading ? (
              <>
                <svg style={{ animation: 'spin 1s linear infinite' }} height="20" width="20" viewBox="0 0 24 24">
                  <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Updating...</span>
              </>
            ) : (
              <>
                <Key size={18} />
                <span>Update Password</span>
              </>
            )}
          </button>
        </form>

        <div style={styles.footer}>
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>Your data is secure and encrypted</span>
        </div>
      </div>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
