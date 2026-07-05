import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

/**
 * GET /api/auth/me
 *
 * Returns the authenticated user's profile WITHOUT exposing any token.
 *
 * Strategy:
 * 1. First, try to read from `radora_user_profile` — a non-sensitive JSON cookie
 *    that we set at login time containing only id, name, email, role, image.
 *    This avoids an extra round-trip to the backend on every page load.
 *
 * 2. If that cookie is missing, fallback to calling the backend /users/me endpoint
 *    using the HttpOnly access token (server-side only).
 */
export async function GET(req: NextRequest) {
  // Fast path: read from the non-sensitive profile cookie
  const profileCookie = req.cookies.get("radora_user_profile")?.value;
  if (profileCookie) {
    try {
      const user = JSON.parse(decodeURIComponent(profileCookie));
      return NextResponse.json({ user }, { status: 200 });
    } catch {
      // Malformed cookie — fall through to backend call
    }
  }

  // Fallback: call the backend /users/me using the HttpOnly access token
  const accessToken = req.cookies.get("radora_access_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const backendRes = await fetch(`${API_BASE}/users/me`, {
      headers: {
        Authorization: `Bearer ${decodeURIComponent(accessToken)}`,
        "Content-Type": "application/json",
      },
    });

    if (!backendRes.ok) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentType = backendRes.headers.get("content-type");
    const isJson = contentType && contentType.includes("application/json");
    const data = isJson ? await backendRes.json() : {};

    const userProfile = {
      id: data.id ?? data._id,
      name: data.name,
      email: data.email ?? null,
      rollNumber: data.rollNumber ?? null,
      role: data.role,
      image: data.profilePhotoUrl ?? null,
    };

    return NextResponse.json({ user: userProfile }, { status: 200 });
  } catch (err: any) {
    console.error("[/api/auth/me] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
