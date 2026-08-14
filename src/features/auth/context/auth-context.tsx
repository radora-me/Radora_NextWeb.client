"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { UserRole } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { User } from "@/types/api.types";

const studentRoutePrefixes = [
  '/student-dashboard',
  '/student-attendance',
  '/student-timetable',
  '/student-ai-chat',
  '/student-classroom-chat',
  '/student-homework',
  '/student-notifications',
];

const teacherRoutePrefixes = [
  '/teacher-dashboard',
  '/teacher-students',
  '/teacher-attendance',
  '/teacher-homework',
  '/teacher-chat',
  '/teacher-profile',
  '/teacher-notifications',
];

const adminRoutePrefixes = [
  '/dashboard',
  '/attendance',
  '/timetable',
  '/exams',
  '/fees',
  '/students',
  '/teachers',
  '/notifications',
];

const sharedRoutePrefixes = [
  '/settings',
];

const authRoutePrefixes = ['/login', '/register'];

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
  const pathname = usePathname();
  const queryClient = useQueryClient();

  // Client-side route protection (protects against browser back/forward cache)
  useEffect(() => {
    if (loading) return;

    const isAuthRoute = authRoutePrefixes.some(p => pathname.startsWith(p));
    const isStudentRoute = studentRoutePrefixes.some(p => pathname.startsWith(p));
    const isTeacherRoute = teacherRoutePrefixes.some(p => pathname.startsWith(p));
    const isAdminRoute = adminRoutePrefixes.some(p => pathname.startsWith(p));
    const isSharedRoute = sharedRoutePrefixes.some(p => pathname.startsWith(p));

    if (!user && (isStudentRoute || isTeacherRoute || isAdminRoute || isSharedRoute)) {
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
      return;
    }

    if (user) {
      if (isSharedRoute) {
        // Allow all logged-in users to access shared routes
        return;
      }
      
      if (user.role === 'student' && (isAdminRoute || isTeacherRoute)) {
        router.push('/student-dashboard');
      } else if (user.role === 'teacher' && (isAdminRoute || isStudentRoute)) {
        router.push('/teacher-dashboard');
      } else if (user.role === 'admin' && (isStudentRoute || isTeacherRoute)) {
        router.push('/dashboard');
      } else if (isAuthRoute) {
        if (user.role === 'student') router.push('/student-dashboard');
        else if (user.role === 'teacher') router.push('/teacher-dashboard');
        else router.push('/dashboard');
      }
    }
  }, [user, loading, pathname, router]);

  // On mount: hydrate user state from the server-side /api/auth/me endpoint.
  // This reads the HttpOnly access token cookie server-side so the token
  // is never exposed to JavaScript at all.
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "same-origin" });
        if (res.ok) {
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const data = await res.json();
            setUser(data.user ?? null);
          } else {
            setUser(null);
          }
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
    queryClient.clear(); // Wipe all cached data to prevent data leakage between accounts
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
