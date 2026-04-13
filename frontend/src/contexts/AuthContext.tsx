'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';
import { User, RegisterPayload, LoginPayload } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const COOKIE_OPTS = { expires: 7, sameSite: 'strict' as const };

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const persist = (jwt: string, userData: User) => {
    Cookies.set('jwt', jwt, COOKIE_OPTS);
    Cookies.set('user', JSON.stringify(userData), COOKIE_OPTS);
    setToken(jwt);
    setUser(userData);
  };

  const clearAuth = useCallback(() => {
    Cookies.remove('jwt');
    Cookies.remove('user');
    setToken(null);
    setUser(null);
  }, []);

  // Restore session
  useEffect(() => {
    const savedToken = Cookies.get('jwt');
    const savedUser = Cookies.get('user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));

        axios
          .get(`${API_BASE}/api/users/me`, {
            headers: { Authorization: `Bearer ${savedToken}` },
          })
          .then((r) => setUser(r.data))
          .catch(() => clearAuth());
      } catch {
        clearAuth();
      }
    }

    setIsLoading(false);
  }, [clearAuth]);

  // ✅ LOGIN (backend route match)
  const login = async (payload: LoginPayload) => {
    const { data } = await axios.post<{ jwt: string; user: User }>(
      `${API_BASE}/api/auth/local`,
      payload
    );
    persist(data.jwt, data.user);
  };

  // ✅ REGISTER (backend route match)
  const register = async (payload: RegisterPayload) => {
    const { data } = await axios.post<{ jwt: string; user: User }>(
      `${API_BASE}/api/auth/local/register`,
      payload
    );
    persist(data.jwt, data.user);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        register,
        logout: clearAuth,
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