'use client';
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { api, ApiError, getToken, setToken, User } from '@/lib/api';

interface Ctx {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (b: { name: string; email: string; phone: string; password: string }) => Promise<User>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthCtx = createContext<Ctx>(null as unknown as Ctx);
export const useAuth = () => useContext(AuthCtx);

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!getToken()) return setUser(null);
    try {
      setUser((await api<{ user: User }>('/auth/me')).user);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) setUser(null);
    }
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
    const off = () => setUser(null);
    window.addEventListener('ihub:logout', off);
    return () => window.removeEventListener('ihub:logout', off);
  }, [refresh]);

  const finish = (r: { token: string; user: User }) => {
    setToken(r.token);
    setUser(r.user);
    return r.user;
  };

  const value: Ctx = {
    user,
    loading,
    refresh,
    login: async (email, password) => finish(await api('/auth/login', { body: { email, password } })),
    register: async (body) => finish(await api('/auth/register', { body })),
    logout: () => {
      setToken(null);
      setUser(null);
    },
  };
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
