import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

/**
 * Generic API proxy: forwards requests to the backend, automatically
 * injecting the HttpOnly access token. The browser never sees the token.
 *
 * Usage: /api/proxy/chat/rooms  →  forwards to  {API_BASE}/chat/rooms
 *
 * Note: In Next.js 15+, dynamic route params are returned as a Promise.
 */

type RouteContext = { params: Promise<{ path: string[] }> };

async function proxyRequest(
  req: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  const accessToken = req.cookies.get("radora_access_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Await the params Promise (Next.js 15+ requirement)
  const { path: pathSegments } = await context.params;

  const backendPath = pathSegments.join("/");
  const search = req.nextUrl.search; // preserve query params
  const url = `${API_BASE}/${backendPath}${search}`;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${decodeURIComponent(accessToken)}`,
    "Content-Type": "application/json",
  };

  let body: BodyInit | null = null;
  if (req.method !== "GET" && req.method !== "DELETE") {
    try {
      const text = await req.text();
      if (text) body = text;
    } catch {
      // no body
    }
  }

  try {
    const backendRes = await fetch(url, { 
      method: req.method, 
      headers, 
      body 
    });

    // If the backend returns 401 (token expired), signal the client to refresh
    if (backendRes.status === 401) {
      return NextResponse.json({ error: "token_expired" }, { status: 401 });
    }

    const contentType = backendRes.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const data = await backendRes.json();
      return NextResponse.json(data, { status: backendRes.status });
    }

    // Forward non-JSON (like files, PDFs, images) along with their headers
    const responseHeaders = new Headers();
    backendRes.headers.forEach((value, key) => {
      // Fetch automatically decodes the body, so forwarding content-encoding can break the stream
      if (key.toLowerCase() !== 'content-encoding') {
        responseHeaders.set(key, value);
      }
    });

    return new NextResponse(backendRes.body, { 
      status: backendRes.status,
      headers: responseHeaders 
    });
  } catch (err: any) {
    console.error(`[/api/proxy/${backendPath}] Error:`, err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest, context: RouteContext) {
  return proxyRequest(req, context);
}

export async function POST(req: NextRequest, context: RouteContext) {
  return proxyRequest(req, context);
}

export async function PUT(req: NextRequest, context: RouteContext) {
  return proxyRequest(req, context);
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  return proxyRequest(req, context);
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  return proxyRequest(req, context);
}
