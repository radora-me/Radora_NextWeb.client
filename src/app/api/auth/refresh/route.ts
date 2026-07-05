import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
const TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;

function buildCookieString(
  name: string,
  value: string,
  maxAge: number,
  httpOnly: boolean
): string {
  let cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
  if (httpOnly) cookie += "; HttpOnly";
  if (process.env.NODE_ENV === "production") cookie += "; Secure";
  return cookie;
}

export async function POST(req: NextRequest) {
  // Read the HttpOnly refresh token cookie (not accessible from browser JS)
  const refreshToken = req.cookies.get("radora_refresh_token")?.value;

  if (!refreshToken) {
    return NextResponse.json({ error: "No refresh token" }, { status: 401 });
  }

  try {
    const backendRes = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: decodeURIComponent(refreshToken) }),
    });

    const contentType = backendRes.headers.get("content-type");
    const isJson = contentType && contentType.includes("application/json");
    const data = isJson ? await backendRes.json() : { message: "Server returned an invalid response" };

    if (!backendRes.ok || (isJson && !data.accessToken)) {
      // Refresh failed — clear all auth cookies
      const response = NextResponse.json(
        { error: "Session expired" },
        { status: 401 }
      );
      response.headers.append("Set-Cookie", "radora_access_token=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax");
      response.headers.append("Set-Cookie", "radora_refresh_token=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax");
      response.headers.append("Set-Cookie", "radora_role=; Path=/; Max-Age=0; SameSite=Lax");
      return response;
    }

    const response = NextResponse.json({ ok: true }, { status: 200 });

    // Rotate the access token cookie (HttpOnly)
    response.headers.append(
      "Set-Cookie",
      buildCookieString("radora_access_token", data.accessToken, TOKEN_TTL_SECONDS, true)
    );

    // Rotate refresh token if the backend returns a new one
    if (data.refreshToken) {
      response.headers.append(
        "Set-Cookie",
        buildCookieString("radora_refresh_token", data.refreshToken, TOKEN_TTL_SECONDS, true)
      );
    }

    return response;
  } catch (err: any) {
    console.error("[/api/auth/refresh] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
