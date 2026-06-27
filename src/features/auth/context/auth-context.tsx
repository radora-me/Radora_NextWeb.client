"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserRole } from "@/types";

export interface User {
  id: string;
  name: string;
  email?: string | null;
  rollNumber?: string | null;
  role: UserRole;
  image?: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (
    identifier: string,
    password: string,
    roleType: "admin" | "teacher" | "student"
  ) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // On mount: hydrate user state from the server-side /api/auth/me endpoint.
  // This reads the HttpOnly access token cookie server-side so the token
  // is never exposed to JavaScript at all.
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "same-origin" });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user ?? null);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /**
   * Login: calls the Next.js proxy which forwards credentials to the backend
   * and sets HttpOnly cookies. Tokens never reach browser JavaScript.
   */
  const login = async (
    identifier: string,
    password: string,
    roleType: "admin" | "teacher" | "student"
  ): Promise<{ error?: string }> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ identifier, password, roleType }),
      });

      const data = await res.json();

      if (!res.ok || !data.user) {
        return { error: data.error || "Invalid credentials" };
      }

      setUser(data.user);
      return {};
    } catch (err: any) {
      console.error("Login request failed:", err);
      return { error: err.message || "Network error. Please try again." };
    }
  };

  /**
   * Logout: calls the server-side proxy which clears the HttpOnly cookies.
   * JavaScript alone cannot clear HttpOnly cookies — the server must do it.
   */
  const logout = async (): Promise<void> => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });
    } catch {
      // best-effort
    }
    setUser(null);
    router.push("/login");
  };

  /**
   * Refresh session: calls the server-side refresh proxy which reads the
   * HttpOnly refresh token, gets a new access token, and re-sets the cookie.
   */
  const refreshSession = async (): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "same-origin",
      });

      if (!res.ok) {
        await logout();
        return false;
      }

      return true;
    } catch {
      await logout();
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshSession }}>
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
