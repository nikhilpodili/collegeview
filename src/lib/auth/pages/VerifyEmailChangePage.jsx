/**
 * VerifyEmailChangePage — Two-Step Email Change OTP Verification
 *
 * With Supabase "Secure Email Change" enabled, Supabase sends an OTP to BOTH
 * the old email AND the new email. Both must be verified.
 *
 * Step 1: verifyOtp({ email: OLD_EMAIL, token, type: 'email_change' })
 * Step 2: verifyOtp({ email: NEW_EMAIL, token, type: 'email_change' })
 *
 * sessionStorage keys:
 *   emailChangeTarget  — the NEW email address
 *   emailChangeOldEmail — the OLD email address (set in ChangeEmailPage)
 *
 * This is a PUBLIC route (not wrapped in ProtectedRoute).
 */
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, AlertCircle, CheckCircle, RefreshCw, ArrowLeft, ArrowRight } from 'lucide-react';
import { supabase } from '../../hooks/supabase';
import { EMAIL_OTP_LENGTH } from '../components/validation';

// Configuration for OTP length, can also be changed from supabase dashboard settings
export const OTP_LENGTH = EMAIL_OTP_LENGTH;
const OTP_PLACEHOLDER = '• '.repeat(OTP_LENGTH).trim();

export default function VerifyEmailChangePage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Read emails — URL param takes priority, sessionStorage is fallback
    const newEmailFromUrl = searchParams.get('email') || '';
    const newEmail = newEmailFromUrl || sessionStorage.getItem('emailChangeTarget') || '';
    const oldEmail = sessionStorage.getItem('emailChangeOldEmail') || '';

    // ── State ─────────────────────────────────────────────────────────────────
    // step: 'old' = verifying old email code, 'new' = verifying new email code, 'done' = complete
    const [step, setStep] = useState('old');
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isResending, setIsResending] = useState(false);
    const [cooldownTime, setCooldownTime] = useState(0);
    const [resendMessage, setResendMessage] = useState('');
    const inputRef = useRef(null);

    // Current email being verified depends on step
    const currentEmail = step === 'old' ? oldEmail : newEmail;

    // Guard: need both emails
    useEffect(() => {
        if (!newEmail) {
            navigate('/auth/change-email', { replace: true });
        }
    }, [newEmail, navigate]);

    // Cooldown timer
    useEffect(() => {
        if (cooldownTime > 0) {
            const timer = setTimeout(() => setCooldownTime((t) => t - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldownTime]);

    // Auto-focus input on step change
    useEffect(() => {
        setOtp('');
        setError('');
        setResendMessage('');
        setTimeout(() => inputRef.current?.focus(), 50);
    }, [step]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const token = otp.trim();
        if (token.length < OTP_LENGTH) {
            setError(`Please enter the full ${OTP_LENGTH}-digit verification code.`);
            return;
        }

        if (!currentEmail) {
            setError('Could not determine email address. Please restart the process.');
            return;
        }

        setIsLoading(true);
        try {
            console.log(`Verifying OTP [step: ${step}] for:`, currentEmail);

            const { data, error: verifyError } = await supabase.auth.verifyOtp({
                email: currentEmail,
                token,
                type: 'email_change',
            });

            if (verifyError) {
                console.error(' verifyOtp error:', verifyError);
                setError(verifyError.message || 'Invalid or expired code. Please try again.');
                return;
            }

            console.log('verifyOtp success:', data?.user?.email);

            if (step === 'old') {
                // First code verified — move to new email step
                setSuccess('Old email verified! Now check your new email inbox.');
                setTimeout(() => {
                    setSuccess('');
                    setStep('new');
                }, 1500);
            } else {
                // Both verified — update profiles table and finish
                const userId = data?.user?.id;
                if (userId && newEmail) {
                    await supabase
                        .from('profiles')
                        .update({ email: newEmail })
                        .eq('id', userId);
                }

                // Clean up sessionStorage
                sessionStorage.removeItem('emailChangeTarget');
                sessionStorage.removeItem('emailChangeOldEmail');

                setSuccess('Email changed successfully! Signing you out...');

                // Sign out and redirect to login
                setTimeout(async () => {
                    await supabase.auth.signOut();
                    navigate('/auth', { replace: true });
                }, 2000);
            }
        } catch (err) {
            console.error('Runtime error:', err);
            setError(err.message || 'Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (cooldownTime > 0 || !newEmail) return;

        setIsResending(true);
        setError('');
        setResendMessage('');

        try {
            // Re-trigger updateUser to send fresh codes to both emails
            const { error: resendError } = await supabase.auth.updateUser(
                { email: newEmail },
                { emailRedirectTo: `${window.location.origin}/auth/callback` }
            );

            if (resendError) {
                setError(resendError.message || 'Failed to resend codes. Your session may have expired.');
                return;
            }

            // Reset back to step 'old' if codes are re-sent (both codes are new)
            setStep('old');
            setCooldownTime(60);
            setResendMessage('New codes sent to both your old and new email inboxes.');
            setTimeout(() => setResendMessage(''), 7000);
        } catch (err) {
            setError(err.message || 'Failed to resend codes.');
        } finally {
            setIsResending(false);
        }
    };

    // ── Styles ────────────────────────────────────────────────────────────────
    const s = {
        container: {
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--surface)',
            backgroundImage: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-muted) 100%)',
            padding: '48px 16px',
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
        stepBar: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
        },
        stepItem: (active, done) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flex: 1,
        }),
        stepDot: (active, done) => ({
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '700',
            fontSize: '14px',
            flexShrink: 0,
            backgroundColor: done ? 'var(--oxford)' : active ? 'var(--oxford)' : 'var(--surface-muted)',
            color: done || active ? '#fff' : 'var(--text-muted)',
            border: `2px solid ${done || active ? 'var(--oxford)' : 'var(--border)'}`,
            transition: 'all 0.3s ease',
        }),
        stepLabel: (active, done) => ({
            fontSize: '15px',
            fontWeight: active || done ? '600' : '400',
            color: active || done ? 'var(--oxford)' : 'var(--text-muted)',
            transition: 'all 0.3s ease',
        }),
        stepConnector: {
            flex: 1,
            height: '2px',
            backgroundColor: step === 'new' || step === 'done' ? 'var(--oxford)' : 'var(--border)',
            transition: 'background-color 0.3s ease',
        },
        header: {
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
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
            fontSize: '18px',
            color: 'var(--text-secondary)',
            lineHeight: '1.6',
            margin: 0,
        },
        emailPill: {
            display: 'inline-block',
            backgroundColor: 'var(--surface-muted)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-md)',
            padding: '4px 10px',
            fontSize: '15px',
            fontWeight: '700',
            color: 'var(--text-primary)',
            marginTop: '2px',
        },
        form: { display: 'flex', flexDirection: 'column', gap: '16px' },
        inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
        label: {
            fontSize: '16px',
            fontWeight: '600',
            color: 'var(--text-primary)',
            textAlign: 'center',
        },
        inputWrapper: { position: 'relative' },
        inputIcon: {
            position: 'absolute',
            left: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
            pointerEvents: 'none',
        },
        input: (hasError) => ({
            width: '100%',
            padding: '14px 14px 14px 48px',
            border: `2px solid ${hasError ? 'var(--red)' : 'var(--border)'}`,
            borderRadius: 'var(--r-lg)',
            fontSize: '28px',
            textAlign: 'center',
            letterSpacing: '0.3em',
            fontWeight: '700',
            transition: 'all 0.2s ease',
            outline: 'none',
            backgroundColor: 'var(--surface-card)',
            color: 'var(--text-primary)',
            boxSizing: 'border-box',
        }),
        hintText: {
            fontSize: '14px',
            color: 'var(--text-muted)',
            textAlign: 'center',
            margin: 0,
        },
        statusBox: (type) => ({
            padding: '13px 15px',
            borderRadius: 'var(--r-lg)',
            backgroundColor:
                type === 'success' ? 'var(--green-bg)' :
                type === 'info'    ? 'var(--blue-bg)'  : 'var(--red-bg)',
            border: `1px solid ${
                type === 'success' ? 'rgba(21,128,61,0.2)' :
                type === 'info'    ? 'rgba(0,33,71,0.1)'   : 'rgba(185,28,28,0.2)'
            }`,
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
        }),
        btnPrimary: (disabled) => ({
            width: '100%',
            padding: '13px 24px',
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
            gap: '8px',
            boxShadow: disabled ? 'none' : 'var(--shadow-md)',
        }),
        btnOutline: (disabled) => ({
            width: '100%',
            padding: '11px 24px',
            backgroundColor: 'transparent',
            border: '2px solid var(--border)',
            color: 'var(--text-secondary)',
            borderRadius: 'var(--r-lg)',
            fontSize: '14px',
            fontWeight: '600',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            opacity: disabled ? 0.55 : 1,
        }),
        divider: { display: 'flex', alignItems: 'center', gap: '10px' },
        dividerLine: { flex: 1, height: '1px', backgroundColor: 'var(--border)' },
        dividerText: { fontSize: '12px', color: 'var(--text-muted)', fontWeight: '500' },
        footer: {
            textAlign: 'center',
            fontSize: '13px',
            color: 'var(--text-muted)',
            paddingTop: '4px',
            borderTop: '1px solid var(--border)',
        },
    };

    if (!newEmail) return null;

    const isOldStep = step === 'old';
    const stepDone = step === 'new' || step === 'done';
    const allDone = step === 'done';

    return (
        <div style={s.container}>
            <div style={s.card}>

                {/* Progress bar */}
                <div style={s.stepBar}>
                    {/* Step 1 */}
                    <div style={s.stepItem(isOldStep, stepDone)}>
                        <div style={s.stepDot(isOldStep, stepDone)}>
                            {stepDone ? <CheckCircle size={16} /> : '1'}
                        </div>
                        <span style={s.stepLabel(isOldStep, stepDone)}>Old Email</span>
                    </div>
                    {/* Connector */}
                    <div style={s.stepConnector} />
                    {/* Step 2 */}
                    <div style={s.stepItem(!isOldStep, allDone)}>
                        <div style={s.stepDot(!isOldStep, allDone)}>
                            {allDone ? <CheckCircle size={16} /> : '2'}
                        </div>
                        <span style={s.stepLabel(!isOldStep, allDone)}>New Email</span>
                    </div>
                </div>

                {/* Header */}
                <div style={s.header}>
                    <div style={s.iconWrapper}>
                        <Mail size={28} color="var(--oxford)" />
                    </div>
                    <h2 style={s.title}>
                        {isOldStep ? 'Verify Old Email' : 'Verify New Email'}
                    </h2>
                    <p style={s.subtitle}>
                        {isOldStep
                            ? `Enter the ${OTP_LENGTH}-digit code sent to your current email`
                            : `Enter the ${OTP_LENGTH}-digit code sent to your new email`}
                    </p>
                    <span style={s.emailPill}>{currentEmail}</span>
                    {!oldEmail && isOldStep && (
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0', textAlign: 'center' }}>
                            (If "Secure Email Change" is off in Supabase, only one code is sent — skip to step 2)
                        </p>
                    )}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={s.form}>

                    <div style={s.inputGroup}>
                        <label htmlFor="otp" style={s.label}>
                            {isOldStep
                                ? `Code from: ${oldEmail || 'your old email'}`
                                : `Code from: ${newEmail}`}
                        </label>
                        <div style={s.inputWrapper}>
                            <div style={s.inputIcon}><Mail size={19} /></div>
                            <input
                                ref={inputRef}
                                id="otp"
                                type="text"
                                inputMode="numeric"
                                value={otp}
                                onChange={(e) => {
                                    setOtp(e.target.value.replace(/\D/g, '').slice(0, OTP_LENGTH));
                                    if (error) setError('');
                                }}
                                placeholder={OTP_PLACEHOLDER}
                                style={s.input(!!error)}
                                maxLength={OTP_LENGTH}
                                disabled={isLoading || !!success}
                                autoComplete="one-time-code"
                                onFocus={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--oxford)';
                                    e.currentTarget.style.boxShadow = '0 0 0 4px rgba(0,33,71,0.08)';
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.borderColor = error ? 'var(--red)' : 'var(--border)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            />
                        </div>
                        <p style={s.hintText}>
                            Check your {isOldStep ? 'current/old' : 'new'} email inbox. Codes expire in 1 hour.
                        </p>
                    </div>

                    {/* If "Secure Email Change" is OFF — old email OTP is not sent, provide skip */}
                    {isOldStep && !oldEmail && (
                        <div style={s.statusBox('info')}>
                            <Mail size={17} color="var(--oxford)" style={{ flexShrink: 0, marginTop: '1px' }} />
                            <div style={{ flex: 1 }}>
                                <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--oxford)', margin: '0 0 2px 0' }}>
                                    No old email code?
                                </p>
                                <p style={{ fontSize: '12px', color: 'var(--oxford)', margin: 0 }}>
                                    If Supabase only sent one code (to your new email), click "Skip to New Email Code" below.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div style={s.statusBox('error')}>
                            <AlertCircle size={18} color="var(--red)" style={{ marginTop: '1px', flexShrink: 0 }} />
                            <div style={{ flex: 1 }}>
                                <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--red)', margin: '0 0 2px 0' }}>
                                    Verification Failed
                                </p>
                                <p style={{ fontSize: '13px', color: 'var(--red)', margin: 0 }}>{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Success */}
                    {success && (
                        <div style={s.statusBox('success')}>
                            <CheckCircle size={18} color="var(--green)" style={{ marginTop: '1px', flexShrink: 0 }} />
                            <p style={{ fontSize: '13px', color: 'var(--green)', margin: 0 }}>{success}</p>
                        </div>
                    )}

                    {/* Resend message */}
                    {resendMessage && (
                        <div style={s.statusBox('info')}>
                            <CheckCircle size={18} color="var(--oxford)" style={{ marginTop: '1px', flexShrink: 0 }} />
                            <p style={{ fontSize: '13px', color: 'var(--oxford)', margin: 0 }}>{resendMessage}</p>
                        </div>
                    )}

                    {/* Primary verify button */}
                    <button
                        type="submit"
                        disabled={isLoading || otp.length < OTP_LENGTH || !!success}
                        style={s.btnPrimary(isLoading || otp.length < OTP_LENGTH || !!success)}
                        onMouseEnter={(e) => {
                            if (!isLoading && otp.length >= OTP_LENGTH && !success)
                                e.currentTarget.style.backgroundColor = 'var(--oxford-light)';
                        }}
                        onMouseLeave={(e) => {
                            if (!isLoading && otp.length >= OTP_LENGTH && !success)
                                e.currentTarget.style.backgroundColor = 'var(--oxford)';
                        }}
                    >
                        {isLoading ? (
                            <>
                                <svg style={{ animation: 'spin 1s linear infinite' }} height="18" width="18" viewBox="0 0 24 24">
                                    <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                <span>Verifying...</span>
                            </>
                        ) : (
                            <>
                                {isOldStep ? <ArrowRight size={16} /> : <CheckCircle size={16} />}
                                <span>{isOldStep ? 'Verify & Continue' : 'Confirm Email Change'}</span>
                            </>
                        )}
                    </button>

                    <div style={s.divider}>
                        <div style={s.dividerLine} />
                        <span style={s.dividerText}>other options</span>
                        <div style={s.dividerLine} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>

                        {/* Resend codes */}
                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={isResending || cooldownTime > 0 || !!success}
                            style={s.btnOutline(isResending || cooldownTime > 0 || !!success)}
                            onMouseEnter={(e) => {
                                if (!isResending && !cooldownTime && !success) {
                                    e.currentTarget.style.backgroundColor = 'var(--surface-muted)';
                                    e.currentTarget.style.borderColor = 'var(--oxford)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isResending && !cooldownTime && !success) {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.borderColor = 'var(--border)';
                                }
                            }}
                        >
                            <RefreshCw size={14} style={{ animation: isResending ? 'spin 1s linear infinite' : 'none' }} />
                            {isResending ? 'Sending...' : cooldownTime > 0 ? `Resend in ${cooldownTime}s` : 'Resend Both Codes'}
                        </button>

                        {/* Go back to change email form */}
                        <button
                            type="button"
                            onClick={() => navigate('/auth/change-email')}
                            style={s.btnOutline(false)}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'var(--surface-muted)';
                                e.currentTarget.style.borderColor = 'var(--oxford)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.borderColor = 'var(--border)';
                            }}
                        >
                            <ArrowLeft size={14} />
                            Use a Different Email
                        </button>
                    </div>
                </form>

                {/* Footer */}
                <div style={s.footer}>
                    <p style={{ margin: 0 }}>
                        Need help?{' '}
                        <a
                            href="mailto:support@collegeview.com"
                            style={{ color: 'var(--oxford)', fontWeight: '600', textDecoration: 'none' }}
                        >
                            Contact Support
                        </a>
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to   { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
