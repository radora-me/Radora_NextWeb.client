import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ ok: true }, { status: 200 });

  // Clear all four auth cookies by setting Max-Age=0
  response.headers.append(
    "Set-Cookie",
    "radora_access_token=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax"
  );
  response.headers.append(
    "Set-Cookie",
    "radora_refresh_token=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax"
  );
  response.headers.append(
    "Set-Cookie",
    "radora_role=; Path=/; Max-Age=0; SameSite=Lax"
  );
  response.headers.append(
    "Set-Cookie",
    "radora_user_profile=; Path=/; Max-Age=0; SameSite=Lax"
  );

  return response;
}
