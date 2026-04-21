import AsyncStorage from '@react-native-async-storage/async-storage';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, supabaseConfigured } from './supabase';

// ─── Local-mode types ───────────────────────────────────────────────────────

interface LocalAccount {
  id: string;
  email: string;
  password: string;
  username: string;
}

const ACCOUNTS_KEY = '@michelin_accounts';
const SESSION_KEY = '@michelin_session';

async function localSignUp(
  email: string,
  password: string,
  username: string,
): Promise<{ id: string } | string> {
  const raw = await AsyncStorage.getItem(ACCOUNTS_KEY);
  const accounts: LocalAccount[] = raw ? JSON.parse(raw) : [];
  if (accounts.find((a) => a.email === email)) return 'Un compte existe déjà avec cet email';
  const id = `local_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  accounts.push({ id, email, password, username });
  await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify({ id, email, username }));
  return { id };
}

async function localSignIn(email: string, password: string): Promise<{ id: string; username: string } | string> {
  const raw = await AsyncStorage.getItem(ACCOUNTS_KEY);
  const accounts: LocalAccount[] = raw ? JSON.parse(raw) : [];
  const account = accounts.find((a) => a.email === email && a.password === password);
  if (!account) return 'Email ou mot de passe incorrect';
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify({ id: account.id, email, username: account.username }));
  return { id: account.id, username: account.username };
}

async function localGetSession(): Promise<{ id: string; email: string; username: string } | null> {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

async function localSignOut() {
  await AsyncStorage.removeItem(SESSION_KEY);
}

// ─── Context ────────────────────────────────────────────────────────────────

interface AuthUser {
  id: string;
  email: string;
  username: string;
}

interface AuthContextType {
  authUser: AuthUser | null;
  supabaseUser: SupabaseUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string, username: string) => Promise<string | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [supabaseSession, setSupabaseSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (supabaseConfigured) {
      // Supabase mode
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSupabaseSession(session);
        if (session?.user) {
          setAuthUser({ id: session.user.id, email: session.user.email ?? '', username: '' });
        }
        setLoading(false);
      });
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSupabaseSession(session);
        if (session?.user) {
          setAuthUser({ id: session.user.id, email: session.user.email ?? '', username: '' });
        } else {
          setAuthUser(null);
        }
      });
      return () => subscription.unsubscribe();
    } else {
      // Local mode
      localGetSession().then((s) => {
        if (s) setAuthUser({ id: s.id, email: s.email, username: s.username });
        setLoading(false);
      });
    }
  }, []);

  async function signIn(email: string, password: string): Promise<string | null> {
    if (supabaseConfigured) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return error?.message ?? null;
    }
    const result = await localSignIn(email, password);
    if (typeof result === 'string') return result;
    setAuthUser({ id: result.id, email, username: result.username });
    return null;
  }

  async function signUp(email: string, password: string, username: string): Promise<string | null> {
    if (supabaseConfigured) {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) return error.message;
      if (!data.user) return 'Erreur lors de la création du compte';
      await supabase.from('profiles').upsert({
        id: data.user.id,
        username,
        xp: 0,
        level: 1,
        visited_restaurants: [],
        badges: [],
        stats: { totalVisits: 0, bibGourmandVisits: 0, starredVisits: 0, citiesExplored: [], totalXP: 0 },
      });
      return null;
    }
    const result = await localSignUp(email, password, username);
    if (typeof result === 'string') return result;
    setAuthUser({ id: result.id, email, username });
    return null;
  }

  async function signOut() {
    if (supabaseConfigured) {
      await supabase.auth.signOut();
    } else {
      await localSignOut();
      setAuthUser(null);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        authUser,
        supabaseUser: supabaseSession?.user ?? null,
        loading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
