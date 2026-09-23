import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME } from "@/lib/auth";
import { revokeToken } from "@/lib/token-blacklist";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (token) {
    revokeToken(token);
  }

  const response = NextResponse.json({ success: true, message: "Admin logged out and session revoked" });
  response.cookies.delete(ADMIN_COOKIE_NAME);
  return response;
}
