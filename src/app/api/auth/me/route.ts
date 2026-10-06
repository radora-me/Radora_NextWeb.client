import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

/**
 * Returns the authenticated user's profile without exposing any token.
 * Identity is always resolved by the backend; client-modifiable cookies are
 * never trusted for authorization or profile data.
 */
export async function GET(req: NextRequest) {
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
  } catch (err: unknown) {
    console.error("[/api/auth/me] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
