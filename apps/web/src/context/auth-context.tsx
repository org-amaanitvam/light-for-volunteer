"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { api, UserProfile } from "@/lib/api";

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  setUser: (user: UserProfile | null) => void;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  setUser: () => { },
  logout: async () => { },
  refreshProfile: async () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let active = true;

    api
      .getMe()
      .then((u) => {
        if (active) {
          setUser(u);
        }
      })
      .catch(() => {
        // Not logged in or expired
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  const refreshProfile = async () => {
    try {
      const u = await api.getMe();
      setUser(u);
    } catch {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        setUser,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
