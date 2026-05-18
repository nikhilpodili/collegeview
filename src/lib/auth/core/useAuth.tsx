/**
 * useAuth Hook
 * 
 * Provides easy access to the AuthContext which contains:
 * - user: The current authenticated user from Supabase Auth
 * - session: The current auth session
 * - profile: The user's detailed profile from public.profiles
 * - isAuthenticated: Boolean flag for auth state
 * - isLoading: True while initial session/profile are being fetched
 * - isAdmin: True if user profile has is_admin set to true
 * - signUp/signIn/signOut/resetPassword: Auth action functions
 */
import { useContext } from 'react';
import { AuthContext } from './AuthProvider';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};