"use client";

import { createContext, useContext, useEffect, useState } from "react";
import api from "@/lib/axios";
import { clearTokens, isAuthenticated } from "@/lib/auth";
import { AuthUser } from "@/types/user";

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  authenticated: boolean;
  fetchMe: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = async () => {
    try {
      const response = await api.get<AuthUser>("/auth/me/");
      setUser(response.data);
    } catch {
      clearTokens();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearTokens();
    setUser(null);
    window.location.href = "/login";
  };

  useEffect(() => {
    if (isAuthenticated()) {
      fetchMe();
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authenticated: !!user,
        fetchMe,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }

  return context;
}