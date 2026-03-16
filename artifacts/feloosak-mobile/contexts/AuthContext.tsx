import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api, User } from "@/lib/api";

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; name: string; region?: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: { name?: string; region?: string }) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const { user: u } = await api.auth.me();
      setUser(u);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    const { user: u } = await api.auth.login(email, password);
    setUser(u);
    try { await api.seed(); } catch {}
  }, []);

  const register = useCallback(async (data: { email: string; password: string; name: string; region?: string }) => {
    const { user: u } = await api.auth.register(data);
    setUser(u);
    try { await api.seed(); } catch {}
  }, []);

  const logout = useCallback(async () => {
    await api.auth.logout();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (data: { name?: string; region?: string }) => {
    const { user: u } = await api.auth.updateProfile(data);
    setUser(u);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
