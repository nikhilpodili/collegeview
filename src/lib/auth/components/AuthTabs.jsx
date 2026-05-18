
/**
 * Auth Tabs Component
 *
 * Provides tabbed interface for switching between Sign In, Sign Up, and Forgot Password forms
 */

import { SignUpForm } from './SignupForm';
import { SignInForm } from './SigninForm';
import { useNavigate } from 'react-router-dom';

const getTabStyle = (isActive) => {
  const baseStyle = {
    flex: 1,
    padding: '8px 16px',
    fontWeight: 600,
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    outline: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '6px',
    border: '1px solid transparent',
  };

  if (isActive) {
    return {
      ...baseStyle,
      backgroundColor: '#ffffff',
      color: '#002147', 
      border: '1px solid #d1d5db', 
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      fontSize: '1rem',
      zIndex: 1,
    };
  }

  return {
    ...baseStyle,
    backgroundColor: 'transparent',
    color: '#64748b', 
    fontSize: '0.875rem',
    boxShadow: 'none',
  };
};

export function AuthTabs({ activeTab = 'signin', onTabChange, onSuccess }) {
  const navigate = useNavigate();

  const handleSwitchToSignIn = () => {
    if (onTabChange) onTabChange('signin');
  };

  const handleSwitchToSignUp = () => {
    if (onTabChange) onTabChange('signup');
  };

  const handleForgotPassword = () => {
    navigate('/auth/forgot-password');
  };

  // Container styles
  const containerStyle = {
    width: '100%',
    maxWidth: '28rem',
    margin: '0 auto',
  };

  // Tab Navigation Container styles
  const navContainerStyle = {
    display: 'flex',
    marginBottom: '1.5rem',
    backgroundColor: '#f3f4f6',
    borderRadius: '0.5rem',
    padding: '0.25rem',
  };

  return (
    <div style={containerStyle}>

      <div style={navContainerStyle}>
        <button
          onClick={() => onTabChange?.('signin')}
          style={getTabStyle(activeTab === 'signin')}
          onMouseEnter={(e) => {
            if (activeTab !== 'signin') {
              e.currentTarget.style.color = '#111827';
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'signin') {
              e.currentTarget.style.color = '#64748b';
            }
          }}
        >
          Sign In
        </button>
        <button
          onClick={() => onTabChange?.('signup')}
          style={getTabStyle(activeTab === 'signup')}
          onMouseEnter={(e) => {
            if (activeTab !== 'signup') {
              e.currentTarget.style.color = '#111827';
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'signup') {
              e.currentTarget.style.color = '#64748b';
            }
          }}
        >
          Sign Up
        </button>
      </div>
      <div style={{ width: '100%' }}>
        {activeTab === 'signin' && (
          <SignInForm
            onSuccess={onSuccess}
            onSwitchToSignUp={handleSwitchToSignUp}
            onForgotPassword={handleForgotPassword}
          />
        )}

        {activeTab === 'signup' && (
          <SignUpForm
            onSuccess={onSuccess}
            onSwitchToSignIn={handleSwitchToSignIn}
          />
        )}
      </div>
    </div>
  );
}

export default AuthTabs;