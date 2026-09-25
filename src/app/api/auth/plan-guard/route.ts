import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUser, signJwt, COOKIE_NAME, SESSION_MAX_AGE, verifyJwt } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  
  const user = await getCurrentUser();
  if (!user || !token) {
    return NextResponse.json(
      { error: "Error 401 Unauthorized: Session expired or invalid.", authenticated: false, active: false },
      { status: 401 }
    );
  }

  const payload = verifyJwt(token);
  let shouldRefreshCookie = false;

  // If DB says ACTIVE but cookie says otherwise, we must refresh it so middleware unlocks the dashboard
  if (user.planStatus === "ACTIVE" && payload?.planStatus !== "ACTIVE") {
    shouldRefreshCookie = true;
  }
  
  // Auto-clean any dummy or zero-dollar test transactions for unpaid/pending accounts
  if (user.role !== "ADMIN" && user.planStatus !== "ACTIVE") {
    await prisma.paymentTransaction.deleteMany({
      where: {
        userEmail: user.email,
        amount: 0,
      },
    }).catch(() => {});
  }

  const isPlanActive = user.role === "ADMIN" || user.planStatus === "ACTIVE";

  let response: NextResponse;

  if (!isPlanActive) {
    response = NextResponse.json(
      {
        error: "Error 403 Forbidden: Active subscription plan required to access BuzzScout dashboard.",
        code: "PLAN_INACTIVE",
        authenticated: true,
        active: false,
        user: {
          id: user.id,
          email: user.email,
          plan: user.plan,
          planStatus: user.planStatus,
          role: user.role,
        },
      },
      { status: 403 }
    );
  } else {
    response = NextResponse.json({
      success: true,
      active: true,
      authenticated: true,
      plan: user.plan,
      planStatus: user.planStatus,
      role: user.role,
    });
  }

  if (shouldRefreshCookie) {
    const newToken = signJwt({
      userId: user.id,
      email: user.email,
      plan: user.plan,
      planStatus: user.planStatus,
      role: user.role,
      avatarUrl: user.avatarUrl || undefined,
      authProvider: payload?.authProvider || "CREDENTIALS",
    });
    
    // We can't access req.url easily here for localhost check, but we can assume standard secure setting based on NODE_ENV
    response.cookies.set(COOKIE_NAME, newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    });
  }

  return response;
}
