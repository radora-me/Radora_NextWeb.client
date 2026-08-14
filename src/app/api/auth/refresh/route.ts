import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
const TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;

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
      response.cookies.delete("radora_access_token");
      response.cookies.delete("radora_refresh_token");
      response.cookies.delete("radora_role");
      return response;
    }

    const response = NextResponse.json({ ok: true }, { status: 200 });

    const cookieOptions = {
      path: "/",
      maxAge: TOKEN_TTL_SECONDS,
      sameSite: "lax" as const,
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
    };

    response.cookies.set("radora_access_token", data.accessToken, cookieOptions);

    if (data.refreshToken) {
      response.cookies.set("radora_refresh_token", data.refreshToken, cookieOptions);
    }

    return response;
  } catch (err: any) {
    console.error("[/api/auth/refresh] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
