/**
 * Secure API client — all requests go through Next.js server-side proxy routes (/api/proxy/*).
 *
 * This means:
 *  - The access token is stored as an HttpOnly cookie (set by /api/auth/login).
 *  - JavaScript on the page can NEVER read the access or refresh tokens.
 *  - The browser sends a cookie-authenticated request to /api/proxy/* which
 *    the Next.js server reads securely and forwards to the backend.
 *
 * On 401: the client calls /api/auth/refresh (which reads the HttpOnly refresh
 * token server-side), re-sets the HttpOnly access token, and retries once.
 */

// All API calls go to the local Next.js proxy, not directly to the backend.
const PROXY_BASE = "/api/proxy";

/**
 * Silently refresh the access token via the server-side refresh proxy.
 * Returns true on success, false on failure.
 */
async function silentRefresh(): Promise<boolean> {
  try {
    const res = await fetch("/api/auth/refresh", { method: "POST" });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Force a full logout: call the server-side logout proxy to clear HttpOnly cookies,
 * then redirect to /login.
 */
async function handleForceLogout(): Promise<void> {
  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } catch {
    // best-effort
  }
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}

/**
 * Core authenticated fetch.
 *
 * Sends the request to the local Next.js proxy (/api/proxy/{endpoint}).
 * The proxy server reads the HttpOnly access token cookie and attaches it
 * to the backend request — so no token ever appears in browser JS.
 *
 * On a 401 response, attempts a silent token refresh and retries once.
 */
export async function fetchWithAuth(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = `${PROXY_BASE}${endpoint}`;

  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  let response = await fetch(url, { ...options, headers, credentials: "same-origin" });

  if (response.status === 401) {
    console.warn(`[api-client] 401 on ${endpoint} — attempting silent refresh…`);
    const refreshed = await silentRefresh();

    if (refreshed) {
      // Retry original request — the refreshed HttpOnly cookie is now set
      response = await fetch(url, { ...options, headers, credentials: "same-origin" });

      if (response.status === 401) {
        console.error("[api-client] Retry after refresh still 401 — logging out.");
        await handleForceLogout();
        throw new Error("Session expired. Please log in again.");
      }
    } else {
      console.error("[api-client] Silent refresh failed — logging out.");
      await handleForceLogout();
      throw new Error("Session expired. Please log in again.");
    }
  }

  return response;
}

/**
 * JSON convenience wrapper around fetchWithAuth for React Query.
 * Parses the response body and throws on non-OK status codes.
 */
export async function fetchJsonWithAuth<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetchWithAuth(endpoint, options);

  if (response.status === 204) {
    return {} as T;
  }

  const contentType = response.headers.get("content-type");
  const isJson = contentType && contentType.includes("application/json");

  let data: any;
  if (isJson) {
    try {
      data = await response.json();
    } catch (e) {
      data = { message: "Invalid JSON response from server" };
    }
  } else {
    // If it's an HTML error page or text, get it as text
    const text = await response.text();
    data = { message: !response.ok ? "Server Error: The server returned an invalid response." : text };
  }

  if (!response.ok) {
    throw new Error(data.error || data.message || `HTTP Error ${response.status}`);
  }

  return data as T;
}

// Keep this export for any code that still references the raw base URL
// (e.g., form uploads that bypass the proxy). Avoid using this in new code.
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

/**
 * Downloads a file securely with auth cookies, and triggers a browser download.
 */
export async function downloadFileWithAuth(
  endpoint: string,
  filename: string
): Promise<void> {
  const response = await fetchWithAuth(endpoint);

  if (!response.ok) {
    let errorMsg = "Failed to download file";
    try {
      const errorJson = await response.json();
      errorMsg = errorJson.error || errorJson.message || errorMsg;
    } catch {
      // Ignored
    }
    throw new Error(errorMsg);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || "download";
  document.body.appendChild(a);
  a.click();
  
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
