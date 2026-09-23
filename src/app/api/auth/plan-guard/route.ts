import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: "Error 401 Unauthorized: Session expired or invalid.", authenticated: false, active: false },
      { status: 401 }
    );
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

  if (!isPlanActive) {
    return NextResponse.json(
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
  }

  return NextResponse.json({
    success: true,
    active: true,
    authenticated: true,
    plan: user.plan,
    planStatus: user.planStatus,
    role: user.role,
  });
}
