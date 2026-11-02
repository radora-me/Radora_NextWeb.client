import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL } from "@/lib/api-client";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

/**
 * Public, unauthenticated proxy for the approved backend enquiry endpoint.
 * The API base already includes /api/v1, so the enquiry route defaults to /enquiries.
 * WALKTHROUGH_ENQUIRY_API_PATH can override the backend path per environment.
 */
export async function POST(request: NextRequest) {
  const rateLimit = checkRateLimit(getClientIp(request), 5, 15 * 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { success: false, error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  const endpointPath = process.env.WALKTHROUGH_ENQUIRY_API_PATH?.trim() || "/enquiries";

  if (!endpointPath.startsWith("/") || endpointPath.startsWith("//") || endpointPath.includes("://")) {
    return NextResponse.json(
      { success: false, error: "The enquiry service endpoint is misconfigured." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Please check the enquiry form and try again." },
      { status: 400 },
    );
  }

  try {
    const backendResponse = await fetch(`${API_BASE_URL}${endpointPath}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const contentType = backendResponse.headers.get("content-type") ?? "";
    const payload = contentType.includes("application/json")
      ? await backendResponse.json().catch(() => null)
      : null;

    if (!backendResponse.ok) {
      const message =
        payload && typeof payload.error === "string"
          ? payload.error
          : "We couldn't submit your request. Please try again.";
      return NextResponse.json(
        { success: false, error: message },
        { status: backendResponse.status },
      );
    }

    // Do not unlock the walkthrough unless the backend explicitly confirms receipt.
    if (!payload || payload.success !== true) {
      return NextResponse.json(
        { success: false, error: "Radora couldn't confirm your request. Please try again." },
        { status: 502 },
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "We couldn't connect to Radora. Check your connection and try again." },
      { status: 502 },
    );
  }
}
