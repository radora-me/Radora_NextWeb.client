import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { identifier } = body as { identifier: string };

    if (!identifier?.trim()) {
      return NextResponse.json(
        { error: "Unable to process password reset request." },
        { status: 400 }
      );
    }

    const normalizedIdentifier = identifier.trim().toLowerCase();
    const ip = getClientIp(req);
    const ipRateLimit = checkRateLimit(`forgot:ip:${ip}`, 20, 15 * 60 * 1000);
    const identifierRateLimit = checkRateLimit(
      `forgot:identifier:${normalizedIdentifier}`,
      5,
      15 * 60 * 1000,
    );

    if (!ipRateLimit.allowed || !identifierRateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many password reset requests. Please try again later." },
        { status: 429 }
      );
    }

    const backendRes = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: normalizedIdentifier }),
    });

    const data = await backendRes.json();

    if (!backendRes.ok) {
      return NextResponse.json(
        { error: data.error || "Unable to process password reset request." },
        { status: backendRes.status || 400 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err: unknown) {
    console.error("[/api/auth/forgot-password] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
