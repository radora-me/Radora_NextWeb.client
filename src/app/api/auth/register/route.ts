import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password } = body as {
      name: string;
      email: string;
      password: string;
    };

    // Forward to backend — registration doesn't set any auth cookies
    const backendRes = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const contentType = backendRes.headers.get("content-type");
    const isJson = contentType && contentType.includes("application/json");
    const data = isJson ? await backendRes.json() : { message: "Server returned an invalid response" };

    if (!backendRes.ok) {
      return NextResponse.json(
        { error: data.error || data.message || "Registration failed." },
        { status: backendRes.status || 400 }
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: any) {
    console.error("[/api/auth/register] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
