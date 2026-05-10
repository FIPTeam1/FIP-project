'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { authApi } from '@/lib/api';
import type { AuthUser } from '@/lib/types';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    username: string;
    first_name: string;
    last_name: string;
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
    const { token, user: userData } = res.data;
    localStorage.setItem('fip_token', token);
    localStorage.setItem('fip_user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  const register = useCallback(
    async (data: {
      email: string;
      password: string;
      username: string;
      first_name: string;
      last_name: string;
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
