/**
 * SignIn Form Component
 * Handles user authentication with email and password.
 * Integrates with React Hook Form and Zod validation.
 * Navigation after successful sign-in is handled by parent component via onSuccess.
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Mail } from 'lucide-react';
import { useAuth } from '../core/useAuth';
import { SignInFormData, signInSchema } from './validation';
import GoogleSignInButton from './GoogleSignInButton';
import CustomAlert from '../../../components/CustomAlert';

interface SignInFormProps {
  onSuccess?: () => void;
  onSwitchToSignUp?: () => void;
  onForgotPassword?: () => void;
}

export function SignInForm({
  onSuccess,
  onSwitchToSignUp,
  onForgotPassword,
}: SignInFormProps) {
  const { signIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: SignInFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result = await signIn(data.email, data.password);

      if (!result.error) {
        reset();
        onSuccess?.();
      } else {
        if (result.error?.message === 'Email not confirmed') {
          setSubmitError('Please verify your email before signing in.');
        } else if (result.error?.message === 'Invalid login credentials') {
          setSubmitError('Invalid email or password.');
        } else {
          setSubmitError("Couldn't sign you in. Try again.");
        }
      }
    } catch (error) {
      setSubmitError("Couldn't sign you in. Try again.");
      console.error('SignIn error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '28rem', margin: '0 auto' }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '0.75rem',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        border: '1px solid #e5e7eb',
        padding: '1.25rem',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>
            Sign in
          </h2>
        </div>

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
            <label
              htmlFor="email"
              style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}
            >
              Email
            </label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, paddingLeft: '0.75rem', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
                <Mail
                  style={{ height: '1rem', width: '1rem', color: '#9ca3af' }}
                  aria-hidden="true"
                />
              </div>
              <input
                {...register('email')}
                type="email"
                id="email"
                style={{
                  width: '100%',
                  height: '2.5rem',
                  paddingLeft: '2.5rem',
                  paddingRight: '0.75rem',
                  paddingTop: '0.5rem',
                  paddingBottom: '0.5rem',
                  border: '1px solid',
                  borderColor: errors.email ? '#fca5a5' : '#d1d5db',
                  borderRadius: '0.5rem',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  fontSize: '0.875rem',
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = errors.email ? '#fca5a5' : '#d1d5db'}
                placeholder="you@example.com"
                disabled={isSubmitting}
                autoComplete="email"
                aria-invalid={!!errors.email}
              />
            </div>
            {errors.email && (
              <p
                style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: '#dc2626' }}
                role="alert"
              >
                {errors.email.message}
              </p>
            )}
          </div>

      
          <div>
            <label
              htmlFor="password"
              style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.25rem' }}
            >
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                id="password"
                style={{
                  width: '100%',
                  height: '2.5rem',
                  paddingLeft: '0.75rem',
                  paddingRight: '2.5rem',
                  paddingTop: '0.5rem',
                  paddingBottom: '0.5rem',
                  border: '1px solid',
                  borderColor: errors.password ? '#fca5a5' : '#d1d5db',
                  borderRadius: '0.5rem',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  fontSize: '0.875rem',
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = errors.password ? '#fca5a5' : '#d1d5db'}
                disabled={isSubmitting}
                autoComplete="current-password"
                aria-invalid={!!errors.password}
              />
              <button
                type="button"
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  right: 0,
                  paddingRight: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#6b7280',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}
                onClick={() => setShowPassword(!showPassword)}
                disabled={isSubmitting}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff style={{ height: '1rem', width: '1rem' }} />
                ) : (
                  <Eye style={{ height: '1rem', width: '1rem' }} />
                )}
              </button>
            </div>
            {errors.password && (
              <p
                style={{ marginTop: '0.25rem', fontSize: '0.75rem', color: '#dc2626' }}
                role="alert"
              >
                {errors.password.message}
              </p>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.875rem' }}>
            <button
              type="button"
              onClick={onForgotPassword}
              style={{
                fontSize: '0.875rem',
                color: '#2563eb',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0
              }}
              onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
              onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
              disabled={isSubmitting}
            >
              Forgot password?
            </button>
          </div>

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
            onMouseEnter={(e) => {
              if (!isSubmitting && isValid) e.currentTarget.style.backgroundColor = '#1d4ed8';
            }}
            onMouseLeave={(e) => {
              if (!isSubmitting && isValid) e.currentTarget.style.backgroundColor = '#2563eb';
            }}
          >
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <p style={{ fontSize: '0.875rem', color: '#4b5563' }}>
            New here?{' '}
            <button
              type="button"
              onClick={onSwitchToSignUp}
              style={{
                color: '#2563eb',
                fontWeight: 500,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#1d4ed8'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#2563eb'}
            >
              Create account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignInForm;