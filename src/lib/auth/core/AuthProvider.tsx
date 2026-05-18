import {
    createContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    useCallback,
    type ReactNode,
} from 'react';
import type { User, AuthError, Session, } from '@supabase/supabase-js';
import { supabase } from '../../hooks/supabase';
export interface Profile {
    id: string;
    username: string;
    full_name?: string;
    avatar_url?: string;
    bio?: string;
    current_college?: string;
    graduation_year?: number;
    state?: string;
    city?: string;
    gender?: string;
    is_verified?: boolean;
    is_admin?: boolean;
    created_at?: string;
}
// --- CONTEXT TYPE ---
export interface AuthContextType {
    user: User | null;
    session: Session | null;
    profile: Profile | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isAdmin: boolean;
    signUp: (email: string, password: string, username?: string) => Promise<{ error: AuthError | null }>;
    signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
    signOut: () => Promise<{ error: AuthError | null }>;
    resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
    updatePassword: (password: string) => Promise<{ error: AuthError | null }>;
    refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
    undefined
);

type Props = { children: ReactNode };



export function AuthProvider({ children }: Props) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const initCompleteRef = useRef(false);
    const getElapsed = () => ((window.performance.now()) / 1000).toFixed(3) + 's';


    const fetchProfile = useCallback(async (userId: string) => {
        const getTimestamp = () => `[${new Date().toLocaleTimeString()}.${String(Date.now() % 1000).padStart(3, '0')}]`;

        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, username, full_name, avatar_url, is_admin, gender, state, city, current_college, graduation_year')
                .eq('id', userId)
                .maybeSingle();

            if (error) {
                if (error.code === 'PGRST301' || error.message?.includes('JWT')) {
                    setProfile(null);
                    localStorage.removeItem('collegeview_profile_cache');
                    setUser(null);
                    setSession(null);
                    supabase.auth.signOut({ scope: 'local' });
                }
                throw error;
            }

            if (data) {
                setProfile(data as Profile);
                localStorage.setItem('collegeview_profile_cache', JSON.stringify(data));
            } else {
                setProfile(null);
            }
        } catch (error) {
            console.warn(`fetchProfile: Failed or timed out.`, error);
        }
    }, []);


    // --- Authentication Functions ---
    const signUp = useCallback(async (email: string, password: string, username?: string) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                    data: username ? { username } : undefined,
                },
            });
            return { error };
        } catch (err) {
            return { error: err as AuthError };
        }
    }, []);

    const signIn = useCallback(async (email: string, password: string) => {
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            return { error };
        } catch (err) {
            return { error: err as AuthError };
        }
    }, []);

    const signOut = useCallback(async () => {
        try {
            const { error } = await supabase.auth.signOut();

            setProfile(null);
            setUser(null);
            setSession(null);
            localStorage.removeItem('collegeview_profile_cache');

            if (error) {
                console.warn(' API Sign out error, state cleared locally anyway:', error);
                await supabase.auth.signOut({ scope: 'local' });
            }
            return { error: null };
        } catch (err) {
            setProfile(null);
            setUser(null);
            setSession(null);
            localStorage.removeItem('collegeview_profile_cache');
            return { error: err as AuthError };
        }
    }, []);



    const resetPassword = useCallback(async (email: string) => {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/callback`,
            });
            return { error };
        } catch (err) {
            return { error: err as AuthError };
        }
    }, []);

    const updatePassword = useCallback(async (password: string) => {
        try {
            const { error } = await supabase.auth.updateUser({ password });
            return { error };
        } catch (err) {
            return { error: err as AuthError };
        }
    }, []);


    // --- Initialization & Auth Listener Setup ---
    useEffect(() => {
        let mounted = true;
        let initCalled = false;

        const getTimestamp = () => `[${new Date().toLocaleTimeString()}]`;

        const safetyTimeout = setTimeout(() => {
            if (mounted && isLoading) {
                setIsLoading(false);
            }
        }, 5000);

        const finalizeInit = (sessionData: Session | null, source: string) => {
            if (!mounted || initCalled) return;
            initCalled = true;

            setSession(sessionData);
            setUser(sessionData?.user ?? null);

            // Restore profile from cache for instant UI response
            const cachedProfile = localStorage.getItem('collegeview_profile_cache');
            if (cachedProfile && sessionData?.user) {
                try {
                    const parsed = JSON.parse(cachedProfile);
                    // Only use cache if it belongs to the current user
                    if (parsed.id === sessionData.user.id) {
                        console.log(`${getTimestamp()} [${getElapsed()}] 📦 Restored profile from cache.`);
                        setProfile(parsed);
                    }
                } catch (e) {
                    localStorage.removeItem('collegeview_profile_cache');
                }
            }

            const initProfile = async () => {
                if (sessionData?.user) {
                    await fetchProfile(sessionData.user.id);
                }
                if (mounted) {
                    setIsLoading(false);
                    clearTimeout(safetyTimeout);
                }
            };

            initProfile();
        };

        // 1. Set up the event listener FIRST
        console.log(`${getTimestamp()} [${getElapsed()}] 📡 Subscribing to onAuthStateChange...`);
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
            if (!mounted) return;
            console.log(`${getTimestamp()} [${getElapsed()}] 🔐 Supabase Auth Event: ${event}`);

            // If we get a session from an event (like SIGNED_IN on mount), we can finalize early
            if (!initCalled && currentSession) {
                finalizeInit(currentSession, `Event:${event}`);
            } else if (initCalled) {
                // Normal post-init updates
                setSession(currentSession);
                setUser(currentSession?.user ?? null);
                if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
                    if (currentSession?.user) {
                        setIsLoading(true);
                        fetchProfile(currentSession.user.id).finally(() => {
                            if (mounted) setIsLoading(false);
                        });
                    }
                } else if (event === 'SIGNED_OUT') {
                    console.log(`${getTimestamp()} [${getElapsed()}] 🚪 Signed out. Clearing profile.`);
                    setProfile(null);
                    localStorage.removeItem('collegeview_profile_cache');
                }
            }
        });
        const runInit = async () => {
            try {
                const sessionPromise = supabase.auth.getSession();
                const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000));

                const result = await Promise.race([sessionPromise, timeoutPromise]) as any;

                if (result && !initCalled) {
                    finalizeInit(result.data.session, 'getSession');
                }
            } catch (err) {
                console.warn(`getSession check failed or timed out:`, err);
            }
        };

        runInit();

        return () => {
            mounted = false;
            clearTimeout(safetyTimeout);
            subscription.unsubscribe();
        };
    }, [fetchProfile]);

    //  Handle page visibility changes (tab switches, background returns)
    useEffect(() => {
        const handleVisibilityChange = async () => {
            if (document.visibilityState === 'visible' && user && !isLoading) {
                

          
                const { data } = await supabase.auth.getSession();
                setSession(data?.session ?? null);

                if (data.session?.user) {
                    console.log(' Session still valid on visibility change');
                    // Session exists, no need to refetch role (already cached)
                } else {
                    console.log(' Session lost, triggering refresh...');
                    // Only refresh if session is actually lost
                    const { error } = await supabase.auth.refreshSession();
                    if (error) {
                        console.error('Session refresh failed:', error);
                    }
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [user, isLoading]);

    const value = useMemo(
        () => ({
            user,
            session,
            profile,
            isAuthenticated: !!user,
            isLoading,
            isAdmin: profile?.is_admin === true,
            signUp,
            signIn,
            signOut,
            resetPassword,
            updatePassword,
            refreshProfile: async () => {
                if (user) await fetchProfile(user.id);
            },
        }),
        [user, session, profile, isLoading, signUp, signIn, signOut, resetPassword, updatePassword, fetchProfile]
    );


    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}