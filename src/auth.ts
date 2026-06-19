import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

import type { UserRole } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    error?: 'RefreshTokenExpired' | 'RefreshTokenError';
    user: {
      id: string;
      name: string;
      email?: string;
      rollNumber?: string;
      role: UserRole;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    name: string;
    email?: string;
    rollNumber?: string;
    role: UserRole;
    accessToken?: string;
    refreshToken?: string;
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    id: string;
    role: UserRole;
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number; // Unix timestamp (ms)
    email?: string;
    rollNumber?: string;
    error?: 'RefreshTokenExpired' | 'RefreshTokenError';
  }
}

/**
 * Uses the stored refreshToken to silently obtain a new accessToken from the backend.
 * The backend stores the refreshToken in Redis, so this validates the session server-side.
 */
async function refreshAccessToken(token: any) {
  try {
    const response = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: token.refreshToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to refresh token');
    }

    return {
      ...token,
      accessToken: data.accessToken,
      // New access token expires in 15 minutes — refresh 60s before expiry
      accessTokenExpires: Date.now() + 14 * 60 * 1000,
      error: undefined,
    };
  } catch (error) {
    console.error('Token refresh failed:', error);
    return {
      ...token,
      error: 'RefreshTokenError' as const,
    };
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        identifier: { label: 'Email or Roll Number', type: 'text' },
        password: { label: 'Password', type: 'password' },
        roleType: { label: 'Role Type', type: 'text' }, // "student" | "teacher" | "admin"
      },
      async authorize(credentials) {
        const identifier = credentials?.identifier as string;
        const password = credentials?.password as string;
        const roleType = credentials?.roleType as string;

        if (!identifier || !password) return null;

        let endpoint = `${API_BASE}/auth/login/teacher`;
        let payload: any = { email: identifier, password };

        if (roleType === 'student') {
          endpoint = `${API_BASE}/auth/login/student`;
          payload = { rollNumber: identifier, password };
        } else if (roleType === 'admin') {
          // Admin uses same teacher login endpoint (role is checked server-side)
          endpoint = `${API_BASE}/auth/login/teacher`;
          payload = { email: identifier, password };
        }

        try {
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

          const data = await response.json();

          if (!response.ok || !data.user) {
            throw new Error(data.error || 'Invalid credentials');
          }

          // Return both access + refresh tokens to be stored in the JWT
          return {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            rollNumber: data.user.rollNumber,
            role: data.user.role,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
          };
        } catch (error) {
          console.error('Login failed:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    // Session max age should align with refresh token life (7 days)
    maxAge: 7 * 24 * 60 * 60,
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      // On initial sign-in: persist both tokens + compute expiry time
      if (user) {
        return {
          ...token,
          id: user.id,
          role: user.role,
          email: user.email,
          rollNumber: user.rollNumber,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          // Access token expires in 15m — we refresh at 14m to have 60s buffer
          accessTokenExpires: Date.now() + 14 * 60 * 1000,
        };
      }

      // On subsequent calls: check if access token is still valid
      if (token.accessTokenExpires && Date.now() < token.accessTokenExpires) {
        // Token is still valid, return it as-is
        return token;
      }

      // Access token has expired — attempt a silent refresh
      if (token.refreshToken) {
        return refreshAccessToken(token);
      }

      // No refresh token: force re-login
      return { ...token, error: 'RefreshTokenExpired' as const };
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role;
        if (token.email) session.user.email = token.email as string;
        if (token.rollNumber) session.user.rollNumber = token.rollNumber as string;
      }
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.error = token.error;
      return session;
    },

    async authorized({ auth: session }) {
      return !!session?.user;
    },
  },
});
