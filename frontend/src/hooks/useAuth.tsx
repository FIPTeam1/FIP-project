'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { authApi, usersApi } from '@/lib/api';
import type { AuthUser } from '@/lib/types';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    first_name: string;
    last_name?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('fip_token');
    const stored = localStorage.getItem('fip_user');
    if (token && stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('fip_token');
        localStorage.removeItem('fip_user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    const { access_token, refresh_token, expires_at } = res.data;

    localStorage.setItem('fip_token', access_token);
    localStorage.setItem('fip_refresh_token', refresh_token);
    localStorage.setItem('fip_expires_at', String(expires_at));

    // Fetch full profile from /me
    const meRes = await usersApi.me();
    // profile may be null if the Users row insert hasn't propagated yet
    const profile = meRes.data.profile ?? {
      id: meRes.data.auth.id,
      first_name: '',
      last_name: null,
      profile_picture: null,
      rating: null,
      description: null,
    };
    const authUser: AuthUser = {
      id: meRes.data.auth.id,
      email: meRes.data.auth.email,
      profile,
    };
    localStorage.setItem('fip_user', JSON.stringify(authUser));
    setUser(authUser);
  }, []);

  const register = useCallback(
    async (data: {
      email: string;
      password: string;
      first_name: string;
      last_name?: string;
    }) => {
      await authApi.register(data);
      await login(data.email, data.password);
    },
    [login]
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      localStorage.removeItem('fip_token');
      localStorage.removeItem('fip_refresh_token');
      localStorage.removeItem('fip_expires_at');
      localStorage.removeItem('fip_user');
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
