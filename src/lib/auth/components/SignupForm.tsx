import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../core/useAuth';
import { SignUpFormData, signUpFormSchema } from './validation';
import GoogleSignInButton from './GoogleSignInButton';
import { CustomAlert } from '../../../components/CustomAlert';

interface SignUpFormProps {
  onSuccess?: () => void;
  onSwitchToSignIn?: () => void;
}

export function SignUpForm({ onSuccess, onSwitchToSignIn }: SignUpFormProps) {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
    reset,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpFormSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  const getPasswordStrength = (pwd: string) => {
    if (pwd.length < 8) return { label: 'Weak', color: '#ef4444' };
    const hasLetter = /[a-zA-Z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    if (hasLetter && hasNumber)
      return { label: 'Strong', color: '#22c55e' };
    return { label: 'Medium', color: '#f59e0b' };
  };

  const strength = password ? getPasswordStrength(password) : null;

  const onSubmit = async (data: SignUpFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      const result = await signUp(data.email, data.password);
      if (!result.error) {
        setSubmitSuccess(
          'Account created. Check your email to verify your address.'
        );
        reset();
        onSuccess?.();
        setTimeout(() => {
          navigate(
            `/auth/verify-email?email=${encodeURIComponent(data.email)}`,
            { replace: true }
          );
        }, 2000);
      } else {
        setSubmitError("Couldn't sign you up. Try again.");
      }
    } catch (error) {
      setSubmitError("Couldn't sign you up. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerStyle = { width: '100%', maxWidth: '28rem', margin: '0 auto' };
  const cardStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '0.75rem',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e5e7eb',
    padding: '1.25rem',
  };
  const labelStyle = { display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' };

  const getInputStyle = (hasError: boolean) => ({
    width: '100%',
    height: '2.5rem',
    paddingLeft: hasError ? '0.75rem' : '0.75rem',
    paddingRight: '2.5rem',
    border: '1px solid',
    borderColor: hasError ? '#fca5a5' : '#d1d5db',
    borderRadius: '0.5rem',
    outline: 'none',
    transition: 'border-color 0.2s',
    fontSize: '0.875rem',
  });

  const errorTextStyle = { marginTop: '0.25rem', fontSize: '0.75rem', color: '#dc2626' };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>
            Create Account
          </h2>
        </div>

        {submitSuccess && (
          <CustomAlert type="success" className="tw-mb-4">
            {submitSuccess}
          </CustomAlert>
        )}

        <GoogleSignInButton />

        <div style={{ position: 'relative', margin: '1.5rem 0' }}>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '100%', borderTop: '1px solid #d1d5db' }}></div>
          </div>
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', fontSize: '0.875rem' }}>
            <span style={{ padding: '0 0.5rem', backgroundColor: '#ffffff', color: '#6b7280' }}>
              Or continue with email
            </span>
          </div>
        </div>

        {submitError && (
          <CustomAlert type="error" className="tw-mb-4">
            {submitError}
          </CustomAlert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        
          <div>
            <label htmlFor="email" style={labelStyle}>Email</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, paddingLeft: '0.75rem', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                <Mail style={{ height: '1rem', width: '1rem', color: '#9ca3af' }} aria-hidden="true" />
              </div>
              <input
                {...register('email')}
                type="email"
                id="email"
                style={{
                  ...getInputStyle(!!errors.email),
                  paddingLeft: '2.5rem',
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = errors.email ? '#fca5a5' : '#d1d5db'}
                placeholder="you@example.com"
                disabled={isSubmitting}
                autoComplete="email"
                aria-invalid={!!errors.email}
              />
            </div>
            {errors.email && <p style={errorTextStyle} role="alert">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" style={labelStyle}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                id="password"
                style={getInputStyle(!!errors.password)}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = errors.password ? '#fca5a5' : '#d1d5db'}
                disabled={isSubmitting}
                autoComplete="new-password"
              />
              <button
                type="button"
                style={{
                  position: 'absolute', top: 0, bottom: 0, right: 0, paddingRight: '0.75rem',
                  display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280'
                }}
                onClick={() => setShowPassword(!showPassword)}
                disabled={isSubmitting}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff style={{ height: '1rem', width: '1rem' }} /> : <Eye style={{ height: '1rem', width: '1rem' }} />}
              </button>
            </div>

            {strength && (
              <div style={{ marginTop: '0.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ flex: 1, height: '0.25rem', backgroundColor: '#e5e7eb', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', backgroundColor: strength.color, width: '100%' }} />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#4b5563' }}>{strength.label}</span>
                </div>
              </div>
            )}

            {errors.password && <p style={errorTextStyle}>{errors.password.message}</p>}
          </div>


          <div>
            <label htmlFor="confirmPassword" style={labelStyle}>Confirm password</label>
            <div style={{ position: 'relative' }}>
              <input
                {...register('confirmPassword')}
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                style={getInputStyle(!!errors.confirmPassword)}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = errors.confirmPassword ? '#fca5a5' : '#d1d5db'}
                disabled={isSubmitting}
                autoComplete="new-password"
              />
              <button
                type="button"
                style={{
                  position: 'absolute', top: 0, bottom: 0, right: 0, paddingRight: '0.75rem',
                  display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280'
                }}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isSubmitting}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff style={{ height: '1rem', width: '1rem' }} /> : <Eye style={{ height: '1rem', width: '1rem' }} />}
              </button>
            </div>
            {errors.confirmPassword && <p style={errorTextStyle}>{errors.confirmPassword.message}</p>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || !isValid}
            style={{
              width: '100%',
              height: '2.75rem',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              borderRadius: '0.5rem',
              border: 'none',
              fontWeight: 500,
              fontSize: '0.875rem',
              cursor: (isSubmitting || !isValid) ? 'not-allowed' : 'pointer',
              opacity: (isSubmitting || !isValid) ? 0.5 : 1,
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => { if (!isSubmitting && isValid) e.currentTarget.style.backgroundColor = '#1d4ed8'; }}
            onMouseLeave={(e) => { if (!isSubmitting && isValid) e.currentTarget.style.backgroundColor = '#2563eb'; }}
          >
            {isSubmitting ? 'Creating…' : 'Create account'}
          </button>
        </form>

        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.875rem', color: '#4b5563' }}>
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToSignIn}
              style={{ color: '#2563eb', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#1d4ed8'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#2563eb'}
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignUpForm;