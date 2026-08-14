import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

// 7 days in seconds
const TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;

function buildCookieString(
  name: string,
  value: string,
  maxAge: number,
  httpOnly: boolean
): string {
  let cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
  if (httpOnly) cookie += "; HttpOnly";
  // Secure flag: only add in production so localhost dev still works
  if (process.env.NODE_ENV === "production") cookie += "; Secure";
  return cookie;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1";
  const rateLimit = checkRateLimit(ip, 10, 15 * 60 * 1000); // 10 attempts per 15 min

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many authentication attempts. Please try again after 15 minutes." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const { identifier, password, roleType } = body as {
      identifier: string;
      password: string;
      roleType: "admin" | "teacher" | "student";
    };

    // Determine the backend endpoint and payload shape
    let endpoint = `${API_BASE}/auth/login/teacher`;
    let payload: Record<string, string> = { email: identifier, password };

    if (roleType === "student") {
      endpoint = `${API_BASE}/auth/login/student`;
      payload = { rollNumber: identifier, password };
    }

    // Forward login to the backend
    const backendRes = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const contentType = backendRes.headers.get("content-type");
    const isJson = contentType && contentType.includes("application/json");
    const data = isJson ? await backendRes.json() : { message: "Server returned an invalid response" };

    if (!backendRes.ok || (isJson && (!data.user || !data.accessToken))) {
      return NextResponse.json(
        { error: data.error || data.message || "Invalid credentials" },
        { status: backendRes.status || 401 }
      );
    }

    // Enforce that the user's actual role matches the portal they are trying to log into
    if (data.user.role.toLowerCase() !== roleType.toLowerCase()) {
      return NextResponse.json(
        { error: `Access denied. Please use the ${data.user.role.toLowerCase()} portal to login.` },
        { status: 403 }
      );
    }

    // Extract only non-sensitive user profile fields to return to the client
    const userProfile = {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email ?? null,
      rollNumber: data.user.rollNumber ?? null,
      role: data.user.role,
      image: data.user.profilePhotoUrl ?? null,
    };

    const response = NextResponse.json({ user: userProfile }, { status: 200 });

    // Set tokens as HttpOnly — JavaScript on the page can NEVER read these
    response.headers.append(
      "Set-Cookie",
      buildCookieString("radora_access_token", data.accessToken, TOKEN_TTL_SECONDS, true)
    );
    response.headers.append(
      "Set-Cookie",
      buildCookieString("radora_refresh_token", data.refreshToken, TOKEN_TTL_SECONDS, true)
    );

    // radora_role is non-sensitive (just "admin"/"teacher"/"student") and must be
    // readable by the Edge middleware for RBAC routing, so it is NOT HttpOnly.
    response.headers.append(
      "Set-Cookie",
      buildCookieString("radora_role", userProfile.role, TOKEN_TTL_SECONDS, false)
    );

    // radora_user_profile stores non-sensitive profile data (id, name, role, etc.) so that
    // /api/auth/me can quickly hydrate the user state on page refresh without an extra
    // backend round-trip. Contains NO secret tokens — safe to be non-HttpOnly.
    response.headers.append(
      "Set-Cookie",
      buildCookieString(
        "radora_user_profile",
        JSON.stringify(userProfile),
        TOKEN_TTL_SECONDS,
        false // readable by server-side /api/auth/me route via req.cookies
      )
    );

    return response;
  } catch (err: any) {
    console.error("[/api/auth/login] Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
