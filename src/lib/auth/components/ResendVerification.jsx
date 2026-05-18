import { useState, useEffect } from 'react';
import { Mail, Loader2 } from 'lucide-react';
import { supabase } from '../../hooks/supabase';

export default function ResendVerification({
  email,
  onSuccess,
  onError,
  className = '',
  children,
}) {
  const [isResending, setIsResending] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);

  // Cooldown timer effect
  useEffect(() => {
    if (cooldownTime > 0) {
      const timer = setTimeout(() => {
        setCooldownTime(cooldownTime - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldownTime]);

  const handleResend = async () => {
    if (!email || email.trim() === '') {
      onError?.('No email address provided. Please sign up again.');
      return;
    }

    if (cooldownTime > 0) {
      onError?.(`Please wait ${cooldownTime} seconds before resending`);
      return;
    }

    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      });

      if (error) {
        console.error('Supabase resend error:', error);
        onError?.(error.message || 'Failed to resend verification email');
        return;
      }

      setCooldownTime(60);
      onSuccess?.('Verification email sent successfully! Please check your inbox.');

    } catch (err) {
      console.error('Resend verification error:', err);
      onError?.(err.message || 'An unexpected error occurred');
    } finally {
      setIsResending(false);
    }
  };

  const isDisabled = isResending || cooldownTime > 0 || !email;

  const buttonStyle = {
    width: '100%',
    padding: '14px 24px',
    backgroundColor: isDisabled ? 'var(--surface-muted)' : 'var(--oxford)',
    color: isDisabled ? 'var(--text-muted)' : '#fff',
    borderRadius: 'var(--r-lg)',
    border: 'none',
    fontSize: '16px',
    fontWeight: '600',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    boxShadow: isDisabled ? 'none' : 'var(--shadow-md)',
  };

  return (
    <button
      onClick={handleResend}
      disabled={isDisabled}
      style={buttonStyle}
      onMouseEnter={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.backgroundColor = 'var(--oxford-light)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.backgroundColor = 'var(--oxford)';
          e.currentTarget.style.transform = 'none';
        }
      }}
    >
      {isResending ? (
        <>
          <Loader2 style={{ animation: 'spin 1s linear infinite' }} size={20} />
          <span>Sending...</span>
        </>
      ) : (
        <>
          <Mail size={20} />
          <span>{cooldownTime > 0 ? `Resend in ${cooldownTime}s` : (children || 'Resend Verification Email')}</span>
        </>
      )}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  );
}
