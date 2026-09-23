import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAME } from "@/lib/auth";
import { revokeToken } from "@/lib/token-blacklist";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (token) {
    revokeToken(token);
  }

  const response = NextResponse.json({ success: true, message: "Logged out and session revoked successfully" });
  response.cookies.delete(COOKIE_NAME);
  return response;
}
