import { getSession, signOut } from "next-auth/react";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

/**
 * Core authenticated fetch. Automatically attaches the Bearer access token from the NextAuth session.
 *
 * On a 401 response, it checks if the session has a `RefreshTokenError` and forces a sign-out.
 * NextAuth's JWT callback will have already attempted a silent refresh before this point —
 * if it failed, the session's `error` field will be set to 'RefreshTokenError' or 'RefreshTokenExpired'.
 */
export async function fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const session = await getSession();

  // If we know the refresh token is dead, sign the user out proactively
  if (session?.error === 'RefreshTokenExpired' || session?.error === 'RefreshTokenError') {
    await signOut({ callbackUrl: '/login' });
    throw new Error('Session expired. Please log in again.');
  }

  const token = session?.accessToken;

  const headers = new Headers(options.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // If the backend rejects the token as unauthorized, force sign-out so the
  // user gets re-directed to login rather than seeing a broken UI.
  if (response.status === 401) {
    console.warn(`[api-client] 401 Unauthorized on ${endpoint}. Session may be stale. Signing out.`);
    await signOut({ callbackUrl: '/login' });
    throw new Error('Session expired. Please log in again.');
  }

  return response;
}

/**
 * A wrapper around fetchWithAuth that automatically parses JSON and throws an error
 * if the response is not OK. This is optimized for usage with React Query.
 */
export async function fetchJsonWithAuth<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetchWithAuth(endpoint, options);

  // If it's a 204 No Content, return empty object
  if (response.status === 204) {
    return {} as T;
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || "An error occurred while fetching data");
  }

  return data as T;
}
