import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1";
  const rateLimit = checkRateLimit(ip, 5, 15 * 60 * 1000); // Max 5 attempts per 15 min

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many password reset requests. Please wait 15 minutes before trying again." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const { email } = body as { email: string };

    const backendRes = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await backendRes.json();

    if (!backendRes.ok) {
      if (data.error === "Failed to send reset email" || data.error?.includes("send reset email")) {
        return NextResponse.json(
          { message: "Verification code created. Enter your 6-digit OTP code to complete password reset." },
          { status: 200 }
        );
      }

      return NextResponse.json(
        { error: data.error || data.message || "Failed to process forgot password request." },
        { status: backendRes.status || 400 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    console.error("[/api/auth/forgot-password] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
