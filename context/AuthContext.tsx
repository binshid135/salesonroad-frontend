"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { authAPI, User } from "@/lib/api";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    full_name: string;
    organization_name: string;
    subdomain: string;
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthState {
  user: User | null;
  token: string | null;
}

function getStoredAuth(): AuthState {
  if (typeof window === "undefined") {
    return { user: null, token: null };
  }

  const storedToken = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");

  if (!storedToken || !storedUser) {
    return { user: null, token: null };
  }

  try {
    return { token: storedToken, user: JSON.parse(storedUser) as User };
  } catch {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return { user: null, token: null };
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [{ user, token }, setAuth] = useState<AuthState>({ user: null, token: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setAuth(getStoredAuth());
      setLoading(false);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const res = await authAPI.login(email, password);
    const { token: t, user: u } = res.data;
    localStorage.setItem("token", t);
    localStorage.setItem("user", JSON.stringify(u));
    setAuth({ token: t, user: u });
    return u;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch {
      // ignore network errors on logout
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuth({ token: null, user: null });
  };

  const register = async (data: {
    email: string;
    password: string;
    full_name: string;
    organization_name: string;
    subdomain: string;
  }) => {
    const res = await authAPI.register(data);
    const { token: t, user: u } = res.data;
    localStorage.setItem("token", t);
    localStorage.setItem("user", JSON.stringify(u));
    setAuth({ token: t, user: u });
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
