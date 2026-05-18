import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../hooks/supabase';
import { useAuth } from '../core/useAuth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, AlertCircle, CheckCircle, ArrowLeft, ExternalLink } from 'lucide-react';
import { NewEmailSchema } from '../components/validation';
import {OTP_LENGTH} from './VerifyEmailChangePage';


export default function ChangeEmailPage() {
    const { user, isLoading } = useAuth();
    const navigate = useNavigate();

    const [submitError, setSubmitError] = useState(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSameEmail, setIsSameEmail] = useState(false);
    const [newEmail, setNewEmail] = useState('');
    const submittedRef = useRef(false);

    useEffect(() => {
        if (!isLoading && !user && !submittedRef.current) {
            navigate('/auth', { replace: true });
        }
    }, [user, isLoading, navigate]);

    const {
        register,
        handleSubmit,
        watch,
        trigger,
        formState: { errors, isValid, submitCount },
    } = useForm({
        resolver: zodResolver(NewEmailSchema),
        mode: 'onChange',
    });

    const emailValue = watch('email');
    const confirmEmailValue = watch('confirmEmail');

    useEffect(() => {
        if (emailValue) {
            trigger('confirmEmail');
        }
    }, [emailValue, trigger]);

    useEffect(() => {
        const currentEmail = user?.email?.toLowerCase() || '';
        const entered = (emailValue || '').toLowerCase();
        setIsSameEmail(!!entered && entered === currentEmail);
    }, [emailValue, user]);

    const showEmailError = !!errors.email && (!!emailValue || submitCount > 0);
    const showConfirmEmailError =
        !!errors.confirmEmail && (!!confirmEmailValue || submitCount > 0);

    const onSubmit = async (data) => {
        if (isSameEmail) {
            setSubmitError('New email cannot be the same as your current email.');
            return;
        }

        setIsSubmitting(true);
        setSubmitError(null);

        try {
            const { error } = await supabase.auth.updateUser(
                { email: data.email },
                { emailRedirectTo: `${window.location.origin}/auth/callback` }
            );

            if (error) {
                setSubmitError(error.message || 'Failed to update email.');
                return;
            }

            submittedRef.current = true;
            sessionStorage.setItem('emailChangeTarget', data.email);
            sessionStorage.setItem('emailChangeOldEmail', user?.email || '');

            setNewEmail(data.email);
            setSubmitSuccess(true);
        } catch (err) {
            setSubmitError(err.message || 'Unexpected error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const goToOtpPage = () => {
        navigate(`/auth/verify-email-change?email=${encodeURIComponent(newEmail)}`);
    };

    const handleSignOut = async () => {
        sessionStorage.removeItem('emailChangeTarget');
        await supabase.auth.signOut();
        navigate('/auth', { replace: true });
    };

    // ── Styles ────────────────────────────────────────────────────────────────
    const styles = {
        container: {
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--surface)',
            backgroundImage: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-muted) 100%)',
            fontFamily: 'var(--font-ui)',
            padding: '24px',
        },
        card: {
            maxWidth: '460px',
            width: '100%',
            backgroundColor: 'var(--surface-card)',
            padding: '40px',
            borderRadius: 'var(--r-xl)',
            boxShadow: 'var(--shadow-lg)',
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
            padding: '18px',
            marginBottom: '4px',
        },
        title: {
            fontSize: '24px',
            fontWeight: '700',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-heading)',
            margin: 0,
        },
        subtitle: {
            fontSize: '16px',
            color: 'var(--text-secondary)',
            lineHeight: '1.5',
            margin: 0,
        },
        currentEmail: {
            fontSize: '16px',
            color: 'var(--text-muted)',
            marginTop: '4px',
        },
        form: {
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
        },
        inputGroup: {
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
        },
        label: {
            fontSize: '16px',
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
            zIndex: 1,
        },
        input: (hasError) => ({
            width: '100%',
            padding: '12px 14px 12px 44px',
            border: `1.5px solid ${hasError ? 'var(--red)' : 'var(--border)'}`,
            borderRadius: 'var(--r-lg)',
            fontSize: '14px',
            transition: 'all 0.2s ease',
            outline: 'none',
            backgroundColor: 'var(--surface-card)',
            color: 'var(--text-primary)',
            boxSizing: 'border-box',
        }),
        errorText: {
            fontSize: '12px',
            color: 'var(--red)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginTop: '2px',
        },
        warningBox: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: 'var(--red-bg)',
            border: '1px solid rgba(185, 28, 28, 0.2)',
            borderRadius: 'var(--r-lg)',
            padding: '12px 14px',
            color: 'var(--red)',
            fontSize: '13px',
        },
        errorBox: {
            padding: '14px 16px',
            borderRadius: 'var(--r-lg)',
            backgroundColor: 'var(--red-bg)',
            border: '1px solid rgba(185, 28, 28, 0.2)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
        },
        statusText: {
            fontSize: '14px',
            fontWeight: '700',
            margin: '0 0 2px 0',
        },
        statusSub: {
            fontSize: '13px',
            lineHeight: '1.5',
            margin: 0,
        },
        btnPrimary: (disabled) => ({
            width: '100%',
            padding: '13px 24px',
            backgroundColor: disabled ? 'var(--surface-muted)' : 'var(--oxford)',
            color: disabled ? 'var(--text-muted)' : '#fff',
            borderRadius: 'var(--r-md)',
            border: 'none',
            fontSize: '15px',
            fontWeight: '600',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: disabled ? 'none' : 'var(--shadow-sm)',
        }),
        btnOutline: {
            width: '100%',
            padding: '12px 24px',
            backgroundColor: 'transparent',
            border: '1.5px solid var(--border)',
            color: 'var(--text-secondary)',
            borderRadius: 'var(--r-md)',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
        },
        footer: {
            paddingTop: '16px',
            borderTop: '1px solid var(--border)',
            textAlign: 'center',
        },
        footerText: {
            fontSize: '14px',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            margin: 0,
        },
        infoBox: {
            backgroundColor: 'var(--blue-bg)',
            borderRadius: 'var(--r-lg)',
            padding: '18px 20px',
            border: '1px solid rgba(0, 33, 71, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
        },
        infoTitle: {
            fontSize: '18px',
            fontWeight: '700',
            color: 'var(--oxford)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            margin: 0,
        },
        infoStep: {
            fontSize: '16px',
            color: 'var(--oxford)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            lineHeight: '1.4',
        },
    };

    // ── Loading guard ─────────────────────────────────────────────────────────
    if (isLoading && !submitSuccess) {
        return (
            <div style={styles.container}>
                <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
            </div>
        );
    }

    // ── No user and not submitted → handled by useEffect redirect ─────────────
    if (!user && !submitSuccess) {
        return (
            <div style={styles.container}>
                <p style={{ color: 'var(--text-muted)' }}>Redirecting...</p>
            </div>
        );
    }

    // ── SUCCESS VIEW ──────────────────────────────────────────────────────────
    if (submitSuccess) {
        return (
            <div style={styles.container}>
                <div style={styles.card}>
                    <div style={styles.header}>
                        <div style={styles.iconWrapper}>
                            <CheckCircle size={32} color="var(--oxford)" />
                        </div>
                        <h2 style={styles.title}>Verification Code Sent!</h2>
                        <p style={styles.subtitle}>
                            We've sent a <strong>{OTP_LENGTH}-digit code</strong> to{' '}
                            <strong style={{ color: 'var(--oxford)' }}>{newEmail}</strong>
                        </p>
                    </div>

                    <div style={styles.infoBox}>
                        <h3 style={styles.infoTitle}>
                            <Mail size={15} />
                            Next Steps
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={styles.infoStep}>
                                <span style={{ fontWeight: '700', flexShrink: 0 }}>1.</span>
                                <span>Open your <strong>new</strong> email inbox ({newEmail}).</span>
                            </div>
                            <div style={styles.infoStep}>
                                <span style={{ fontWeight: '700', flexShrink: 0 }}>2.</span>
                                <span>Find the email from us and copy the <strong>{OTP_LENGTH}-digit code</strong>.</span>
                            </div>
                            <div style={styles.infoStep}>
                                <span style={{ fontWeight: '700', flexShrink: 0 }}>3.</span>
                                <span>Click the button below and enter the code to confirm.</span>
                            </div>
                        </div>
                    </div>

                    {/* Primary CTA */}
                    <button
                        onClick={goToOtpPage}
                        style={styles.btnPrimary(false)}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--oxford-light)';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--oxford)';
                            e.currentTarget.style.transform = 'none';
                        }}
                    >
                        <CheckCircle size={18} />
                        <span>Enter Verification Code</span>
                    </button>

                    <button
                        onClick={() => window.open(`mailto:${newEmail}`, '_blank')}
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
                        <ExternalLink size={16} />
                        <span>Open Mail App</span>
                    </button>

                    <div style={styles.footer}>
                        <button
                            onClick={handleSignOut}
                            style={{
                                background: 'none',
                                border: 'none',
                                fontSize: '14px',
                                color: 'var(--oxford)',
                                fontWeight: '600',
                                cursor: 'pointer',
                                padding: 0,
                            }}
                        >
                            Sign Out &amp; Back to Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ── FORM VIEW ─────────────────────────────────────────────────────────────
    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.header}>
                    <div style={styles.iconWrapper}>
                        <Mail size={26} color="var(--oxford)" />
                    </div>
                    <h2 style={styles.title}>Change Your Email</h2>
                    <p style={styles.subtitle}>
                        We'll send a {OTP_LENGTH}-digit code to your new address to confirm the change.
                    </p>
                    <p style={styles.currentEmail}>
                        Current email: <strong>{user?.email}</strong>
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} noValidate style={styles.form}>

                    {/* New Email */}
                    <div style={styles.inputGroup}>
                        <label htmlFor="email" style={styles.label}>New Email Address</label>
                        <div style={styles.inputWrapper}>
                            <div style={styles.inputIcon}><Mail size={17} /></div>
                            <input
                                id="email"
                                type="email"
                                autoComplete="email"
                                placeholder="your.new@email.com"
                                {...register('email')}
                                disabled={isSubmitting}
                                style={styles.input(showEmailError)}
                                onFocus={(e) => {
                                    if (!showEmailError) {
                                        e.currentTarget.style.borderColor = 'var(--oxford)';
                                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,33,71,0.08)';
                                    }
                                }}
                                onBlur={(e) => {
                                    trigger('email');
                                    if (!showEmailError) {
                                        e.currentTarget.style.borderColor = 'var(--border)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }
                                }}
                            />
                        </div>
                        {showEmailError && (
                            <div style={styles.errorText}>
                                <AlertCircle size={13} />
                                <span>{errors.email?.message}</span>
                            </div>
                        )}
                    </div>

                    {/* Confirm Email */}
                    <div style={styles.inputGroup}>
                        <label htmlFor="confirmEmail" style={styles.label}>Confirm New Email</label>
                        <div style={styles.inputWrapper}>
                            <div style={styles.inputIcon}><Mail size={17} /></div>
                            <input
                                id="confirmEmail"
                                type="email"
                                autoComplete="email"
                                placeholder="Confirm your new email"
                                {...register('confirmEmail')}
                                disabled={isSubmitting}
                                style={styles.input(showConfirmEmailError)}
                                onFocus={(e) => {
                                    if (!showConfirmEmailError) {
                                        e.currentTarget.style.borderColor = 'var(--oxford)';
                                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,33,71,0.08)';
                                    }
                                }}
                                onBlur={(e) => {
                                    trigger('confirmEmail');
                                    if (!showConfirmEmailError) {
                                        e.currentTarget.style.borderColor = 'var(--border)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }
                                }}
                            />
                        </div>
                        {showConfirmEmailError && (
                            <div style={styles.errorText}>
                                <AlertCircle size={13} />
                                <span>{errors.confirmEmail?.message}</span>
                            </div>
                        )}
                    </div>

                    {/* Same-email warning */}
                    {isSameEmail && (
                        <div style={styles.warningBox}>
                            <AlertCircle size={16} style={{ flexShrink: 0 }} />
                            <span>New email cannot be the same as your current email.</span>
                        </div>
                    )}

                    {/* Submit error */}
                    {submitError && (
                        <div style={styles.errorBox}>
                            <AlertCircle size={19} color="var(--red)" style={{ marginTop: '1px', flexShrink: 0 }} />
                            <div>
                                <p style={{ ...styles.statusText, color: 'var(--red)' }}>Error</p>
                                <p style={{ ...styles.statusSub, color: 'var(--red)' }}>{submitError}</p>
                            </div>
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isSubmitting || !isValid || isSameEmail}
                        style={styles.btnPrimary(isSubmitting || !isValid || isSameEmail)}
                        onMouseEnter={(e) => {
                            if (!isSubmitting && isValid && !isSameEmail) {
                                e.currentTarget.style.backgroundColor = 'var(--oxford-light)';
                                e.currentTarget.style.transform = 'translateY(-1px)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isSubmitting && isValid && !isSameEmail) {
                                e.currentTarget.style.backgroundColor = 'var(--oxford)';
                                e.currentTarget.style.transform = 'none';
                            }
                        }}
                    >
                        {isSubmitting ? (
                            <>
                                <svg style={{ animation: 'spin 1s linear infinite' }} height="18" width="18" viewBox="0 0 24 24">
                                    <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                <span>Sending Code...</span>
                            </>
                        ) : (
                            <>
                                <Mail size={17} />
                                <span>Send Verification Code</span>
                            </>
                        )}
                    </button>

                    {/* Back */}
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
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
                        <ArrowLeft size={15} />
                        <span>Back</span>
                    </button>
                </form>

                <div style={styles.footer}>
                    <p style={styles.footerText}>
                        <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span>Your data is secure and encrypted</span>
                    </p>
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
