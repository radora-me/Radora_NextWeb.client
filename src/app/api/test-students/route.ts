import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("radora_access_token")?.value;
    
    if (!token) {
      return NextResponse.json({ error: "No token found in cookies" });
    }
    
    const backendRes = await fetch("http://localhost:5000/api/v1/teacher/students", {
      headers: {
        Authorization: `Bearer ${decodeURIComponent(token)}`
      }
    });
    
    const text = await backendRes.text();
    return NextResponse.json({
      status: backendRes.status,
      body: text
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message });
  }
}
