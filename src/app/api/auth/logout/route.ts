import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ ok: true }, { status: 200 });

  // Clear all four auth cookies
  response.cookies.delete("radora_access_token");
  response.cookies.delete("radora_refresh_token");
  response.cookies.delete("radora_role");
  response.cookies.delete("radora_user_profile");

  return response;
}
