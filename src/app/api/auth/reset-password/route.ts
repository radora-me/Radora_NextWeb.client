import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { resetToken, newPassword } = body as { resetToken: string; newPassword: string };

    const backendRes = await fetch(`${API_BASE}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resetToken, newPassword }),
    });

    const contentType = backendRes.headers.get("content-type");
    const isJson = contentType && contentType.includes("application/json");
    const data = isJson ? await backendRes.json() : { message: "Server returned an invalid response" };

    if (!backendRes.ok) {
      return NextResponse.json(
        { error: data.error || data.message || "Failed to reset password." },
        { status: backendRes.status || 400 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    console.error("[/api/auth/reset-password] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
