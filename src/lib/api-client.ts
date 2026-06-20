import { getCookie, setCookie, eraseCookie } from "@/lib/cookies";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

/**
 * Silent refresh helper: requests a new accessToken from the backend using the stored refreshToken.
 */
async function refreshTokens(): Promise<string | null> {
  const refreshToken = getCookie("radora_refresh_token");
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: refreshToken }),
    });

    const data = await res.json();
    if (!res.ok || !data.accessToken) {
      return null;
    }

    setCookie("radora_access_token", data.accessToken, 7);
    return data.accessToken;
  } catch (e) {
    console.error("[api-client] Token refresh failed:", e);
    return null;
  }
}

/**
 * Clears cookies and redirects to the login page.
 */
function handleForceLogout() {
  if (typeof window !== "undefined") {
    eraseCookie("radora_user");
    eraseCookie("radora_access_token");
    eraseCookie("radora_refresh_token");
    window.location.href = "/login";
  }
}

/**
 * Core authenticated fetch. Automatically attaches the Bearer access token from custom cookies.
 *
 * On a 401 response, it attempts to perform a silent refresh using the refresh token, updates
 * the access token cookie, and retries the original request. If both attempts fail, it logs out.
 */
export async function fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<Response> {
  let token = getCookie("radora_access_token");

  const headers = new Headers(options.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  let response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // If unauthorized (401), try to silently refresh token once
  if (response.status === 401) {
    console.warn(`[api-client] 401 Unauthorized on ${endpoint}. Attempting silent token refresh...`);
    const newToken = await refreshTokens();
    
    if (newToken) {
      // Retry request with new token
      const retryHeaders = new Headers(options.headers);
      retryHeaders.set("Authorization", `Bearer ${newToken}`);
      if (!retryHeaders.has("Content-Type") && !(options.body instanceof FormData)) {
        retryHeaders.set("Content-Type", "application/json");
      }
      response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: retryHeaders,
      });
      
      // If it still fails, log out
      if (response.status === 401) {
        console.error(`[api-client] Retry after refresh still failed with 401. Logging out.`);
        handleForceLogout();
        throw new Error('Session expired. Please log in again.');
      }
    } else {
      console.error(`[api-client] Token refresh failed. Logging out.`);
      handleForceLogout();
      throw new Error('Session expired. Please log in again.');
    }
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
