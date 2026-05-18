
/**
 * AuthCallbackPage
 *
 * Handles three types of Supabase auth callbacks:
 *
 * 1. PKCE code exchange  — ?code=...
 *    Used for: magic link sign-in, email verification
 *
 * 2. token (OTP)   — ?token =...&type=email_change|signup|recovery|...
 *    Used for: email change confirmation link, signup OTP link
 *    Supabase sends this format for email-change confirmation emails.
 *
 * 3. Error              — ?error=...&error_description=...
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../hooks/supabase';
import { useAuth } from '../core/useAuth';
import PageLoader from '../components/loading';

export default function AuthCallbackPage() {
    const { isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [exchanging, setExchanging] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const errorCode = params.get('error');
        const code = params.get('code');
        const tokenHash = params.get('token_hash');
        const type = params.get('type'); // 'email_change', 'signup', 'recovery', etc.

        // ── Error from Supabase ──────────────────────────────────────────────
        if (errorCode) {
            const errorDesc = params.get('error_description');
            setError(errorDesc || 'Authentication failed.');
            setTimeout(() => navigate('/auth', { replace: true }), 3000);
            return;
        }

        // ── token_hash flow (email change / OTP links) ───────────────────────
        if (tokenHash && type && !exchanging) {
            const handleTokenHash = async () => {
                setExchanging(true);
                const { data, error: verifyError } = await supabase.auth.verifyOtp({
                    token_hash: tokenHash,
                    type,
                });

                if (verifyError) {
                    setError(verifyError.message || 'Verification failed.');
                    setExchanging(false);
                    setTimeout(() => navigate('/auth', { replace: true }), 3000);
                    return;
                }

                // If this is an email_change, also update the profiles table
                if (type === 'email_change' && data?.user) {
                    const { id, email } = data.user;
                    if (id && email) {
                        await supabase
                            .from('profiles')
                            .update({ email })
                            .eq('id', id);
                    }
                    // Navigate to profile after email change success
                    setTimeout(() => navigate('/profile', { replace: true }), 500);
                    return;
                }

                // For other types, fall through to the isAuthenticated check below
                setExchanging(false);
            };
            handleTokenHash();
            return;
        }

        // ── PKCE code exchange ───────────────────────────────────────────────
        if (code && !exchanging && !isAuthenticated) {
            const handleExchange = async () => {
                setExchanging(true);
                const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
                if (exchangeError) {
                    setError(exchangeError.message);
                    setExchanging(false);
                    setTimeout(() => navigate('/auth', { replace: true }), 3000);
                }
                // On success the auth listener will update isAuthenticated → handled below
            };
            handleExchange();
            return;
        }

        // ── Already authenticated (session established) ──────────────────────
        if (isAuthenticated) {
            setTimeout(() => navigate('/', { replace: true }), 500);
            return;
        }

        // ── Fallback: nothing we can do ──────────────────────────────────────
        if (!isLoading && !isAuthenticated && !code && !tokenHash && !exchanging) {
            setError('Invalid or expired link. Please log in again.');
            setTimeout(() => navigate('/auth', { replace: true }), 2000);
        }
    }, [isAuthenticated, isLoading, navigate, exchanging]);

    const styles = {
        container: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            backgroundColor: 'var(--surface)',
            fontFamily: 'var(--font-ui)',
            padding: '24px',
        },
        card: {
            textAlign: 'center',
            padding: '40px',
            backgroundColor: 'var(--surface-card)',
            borderRadius: 'var(--r-xl)',
            boxShadow: 'var(--shadow-lg)',
            maxWidth: '440px',
            width: '100%',
            border: '1px solid var(--border)',
        },
        errorTitle: {
            fontSize: '28px',
            fontWeight: '700',
            color: 'var(--red)',
            marginBottom: '16px',
            fontFamily: 'var(--font-heading)',
        },
        errorMessage: {
            color: 'var(--text-secondary)',
            marginBottom: '28px',
            lineHeight: '1.6',
            fontSize: '15px',
        },
        button: {
            display: 'inline-block',
            padding: '12px 32px',
            backgroundColor: 'var(--oxford)',
            color: '#fff',
            borderRadius: 'var(--r-md)',
            border: 'none',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontSize: '15px',
        },
        loadingWrapper: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
        },
        loadingText: {
            color: 'var(--text-muted)',
            fontSize: '16px',
            fontWeight: '500',
        },
    };

    if (error) {
        return (
            <div style={styles.container}>
                <div style={styles.card}>
                    <h1 style={styles.errorTitle}>Auth Error</h1>
                    <p style={styles.errorMessage}>{error}</p>
                    <button
                        onClick={() => navigate('/auth', { replace: true })}
                        style={styles.button}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--oxford-light)';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--oxford)';
                            e.currentTarget.style.transform = 'none';
                        }}
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.loadingWrapper}>
                <PageLoader />
                <p style={styles.loadingText}>Confirming your identity...</p>
            </div>
        </div>
    );
}