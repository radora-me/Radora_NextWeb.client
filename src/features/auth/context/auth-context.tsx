"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { setCookie, getCookie, eraseCookie } from "@/lib/cookies";
import { UserRole } from "@/types";

export interface User {
  id: string;
  name: string;
  email?: string;
  rollNumber?: string;
  role: UserRole;
  image?: string | null;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  login: (identifier: string, password: string, roleType: "admin" | "teacher" | "student") => Promise<{ error?: string }>;
  logout: () => void;
  refreshSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Initialize auth state from cookies
  useEffect(() => {
    const userCookie = getCookie("radora_user");
    const tokenCookie = getCookie("radora_access_token");
    if (userCookie && tokenCookie) {
      try {
        setUser(JSON.parse(userCookie));
        setAccessToken(tokenCookie);
      } catch (e) {
        console.error("Failed to parse user cookie", e);
      }
    }
    setLoading(false);
  }, []);

  const login = async (
    identifier: string,
    password: string,
    roleType: "admin" | "teacher" | "student"
  ): Promise<{ error?: string }> => {
    let endpoint = `${API_BASE}/auth/login/teacher`;
    let payload: any = { email: identifier, password };

    if (roleType === "student") {
      endpoint = `${API_BASE}/auth/login/student`;
      payload = { rollNumber: identifier, password };
    } else if (roleType === "admin") {
      endpoint = `${API_BASE}/auth/login/teacher`;
      payload = { email: identifier, password };
    }

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.user) {
        return { error: data.error || data.message || "Invalid credentials" };
      }

      const userData: User = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        rollNumber: data.user.rollNumber,
        role: data.user.role,
        image: data.user.profilePhotoUrl,
      };

      // Set cookies for 7 days
      setCookie("radora_user", JSON.stringify(userData), 7);
      setCookie("radora_access_token", data.accessToken, 7);
      setCookie("radora_refresh_token", data.refreshToken, 7);

      setUser(userData);
      setAccessToken(data.accessToken);

      return {};
    } catch (err: any) {
      console.error("Login request failed:", err);
      return { error: err.message || "Network error. Please try again." };
    }
  };

  const logout = () => {
    eraseCookie("radora_user");
    eraseCookie("radora_access_token");
    eraseCookie("radora_refresh_token");
    setUser(null);
    setAccessToken(null);
    router.push("/login");
  };

  const refreshSession = async (): Promise<boolean> => {
    const refreshToken = getCookie("radora_refresh_token");
    if (!refreshToken) {
      logout();
      return false;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: refreshToken }),
      });

      const data = await res.json();

      if (!res.ok) {
        logout();
        return false;
      }

      setCookie("radora_access_token", data.accessToken, 7);
      setAccessToken(data.accessToken);
      return true;
    } catch (err) {
      console.error("Failed to refresh session:", err);
      logout();
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        loading,
        login,
        logout,
        refreshSession,
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
