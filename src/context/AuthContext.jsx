import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);
const ADMIN_EMAIL = 'jireh@foodhub.local';

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadProfile(userId) {
      if (!userId) {
        if (mounted) {
          setProfile(null);
          setProfileLoading(false);
        }
        return;
      }

      try {
        if (mounted) setProfileLoading(true);
        const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();
        if (error && error.code !== 'PGRST116') {
          console.error("Profile load error:", error);
        }
        if (!mounted) return;
        setProfile(data ?? null);
      } catch (err) {
        console.error("Profile load exception:", err);
      } finally {
        if (mounted) setProfileLoading(false);
      }
    }

    supabase.auth.getSession().then(async ({ data, error }) => {
      if (!mounted) return;
      if (error) {
        console.error("Auth session error:", error);
      }
      setSession(data?.session ?? null);
      setUser(data?.session?.user ?? null);
      await loadProfile(data?.session?.user?.id ?? null);
      setLoading(false);
    }).catch(async (error) => {
      console.error("Auth getSession exception:", error);
      if (!mounted) return;
      setSession(null);
      setUser(null);
      setProfile(null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      await loadProfile(nextSession?.user?.id ?? null);

      setLoading(false);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const register = async ({ email, password, fullName, phone }) => {
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName, phone } } });
    if (error) throw error;

    toast.success('Account created successfully');
    return data;
  };

  const login = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    toast.success('Welcome back to FoodHub');
    return data;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    toast.success('Logged out');
  };

  const value = useMemo(() => ({
    session,
    user,
    profile,
    loading,
    profileLoading,
    register,
    login,
    logout,
    role: String(profile?.role ?? '').toLowerCase() || (String(user?.email ?? '').toLowerCase() === ADMIN_EMAIL ? 'admin' : null),
    isAuthenticated: Boolean(user)
  }), [session, user, profile, loading, profileLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);