"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api, User, TokenResponse } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<TokenResponse>;
  signup: (
    email: string,
    password: string,
    fullName?: string,
    firstName?: string,
    lastName?: string
  ) => Promise<TokenResponse>;
  socialLogin: (provider: string, token: string) => Promise<TokenResponse>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("aivora_token");
    }
    return null;
  });

  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("aivora_user");
      if (storedUser) {
        try {
          return JSON.parse(storedUser);
        } catch {
          return null;
        }
      }
    }
    return null;
  });

  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuth = async () => {
      const currentToken = typeof window !== "undefined" ? localStorage.getItem("aivora_token") : null;
      if (!currentToken) {
        setLoading(false);
        return;
      }
      try {
        const fetchedUser = await api.getMe();
        setUser(fetchedUser);
        if (typeof window !== "undefined") {
          localStorage.setItem("aivora_user", JSON.stringify(fetchedUser));
        }
      } catch {
        api.logout();
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    void checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<TokenResponse> => {
    const res = await api.login(email, password);
    setToken(res.access_token);
    setUser(res.user);
    return res;
  };

  const signup = async (
    email: string,
    password: string,
    fullName?: string,
    firstName?: string,
    lastName?: string
  ): Promise<TokenResponse> => {
    const res = await api.signup(email, password, fullName, firstName, lastName);
    setToken(res.access_token);
    setUser(res.user);
    return res;
  };

  const socialLogin = async (provider: string, token: string): Promise<TokenResponse> => {
    const res = await api.socialLogin(provider, token);
    setToken(res.access_token);
    setUser(res.user);
    return res;
  };

  const logout = () => {
    api.logout();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        login,
        signup,
        socialLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
