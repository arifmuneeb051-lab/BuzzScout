import { NextResponse } from "next/server";
import { formatSafeError } from "@/lib/security";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isPlanActive = user.role === "ADMIN" || user.planStatus === "ACTIVE";
  if (!isPlanActive) {
    return NextResponse.json(
      { error: "Error 403 Forbidden: Active subscription plan required to access keywords.", upgradeRequired: true },
      { status: 403 }
    );
  }

  try {
    const keywords = await prisma.keyword.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { leads: true },
        },
      },
    });

    return NextResponse.json({ keywords });
  } catch (err: any) {
    const safeErr = formatSafeError(err);
    return NextResponse.json(safeErr, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { phrase, platform, negativeKeywords, targetSubreddits } = await req.json();

    if (!phrase || phrase.trim().length === 0) {
      return NextResponse.json({ error: "Keyword phrase is required" }, { status: 400 });
    }

    // Subscription Check: Inactive users cannot create keywords via direct API
    const isPlanActive = user.role === "ADMIN" || user.planStatus === "ACTIVE";
    if (!isPlanActive) {
      return NextResponse.json(
        {
          error: "An active Pro subscription or Lifetime Founder Pass is required to track keywords.",
          upgradeRequired: true,
        },
        { status: 403 }
      );
    }

    // Check plan limits: Free plan allows up to 2 keywords, Pro/LTD allows unlimited
    if (user.plan === "FREE") {
      const count = await prisma.keyword.count({ where: { userId: user.id } });
      if (count >= 2) {
        return NextResponse.json(
          {
            error: "Free plan is limited to 2 active keywords. Upgrade to Pro ($5/mo) or LTD ($25) for unlimited tracking!",
            upgradeRequired: true,
          },
          { status: 403 }
        );
      }
    }

    const keyword = await prisma.keyword.create({
      data: {
        userId: user.id,
        phrase: phrase.trim().toLowerCase(),
        platform: platform || "ALL",
        negativeKeywords: negativeKeywords ? negativeKeywords.trim() : null,
        targetSubreddits: targetSubreddits ? targetSubreddits.trim() : null,
        active: true,
      },
    });

    return NextResponse.json({ success: true, keyword });
  } catch (err: any) {
    const safeErr = formatSafeError(err);
    return NextResponse.json(safeErr, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Keyword ID is required" }, { status: 400 });
    }

    const result = await prisma.keyword.deleteMany({
      where: { id, userId: user.id },
    });

    if (result.count === 0) {
      const existsForOther = await prisma.keyword.findFirst({ where: { id } });
      if (existsForOther && existsForOther.userId !== user.id) {
        const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "127.0.0.1";
        const { logSecurityEvent } = await import("@/lib/audit-logger");
        await logSecurityEvent({
          eventType: "IDOR_ATTEMPT_DETECTED",
          userId: user.id,
          email: user.email,
          ipAddress: ip,
          details: `Unauthorized attempt to delete keyword [${id}] belonging to another user`,
          severity: "CRITICAL",
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    const safeErr = formatSafeError(err);
    return NextResponse.json(safeErr, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, active } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Keyword ID is required" }, { status: 400 });
    }

    const updated = await prisma.keyword.updateMany({
      where: { id, userId: user.id },
      data: { active: Boolean(active) },
    });

    if (updated.count === 0) {
      const existsForOther = await prisma.keyword.findFirst({ where: { id } });
      if (existsForOther && existsForOther.userId !== user.id) {
        const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "127.0.0.1";
        const { logSecurityEvent } = await import("@/lib/audit-logger");
        await logSecurityEvent({
          eventType: "IDOR_ATTEMPT_DETECTED",
          userId: user.id,
          email: user.email,
          ipAddress: ip,
          details: `Unauthorized attempt to modify keyword [${id}] belonging to another user`,
          severity: "CRITICAL",
        });
      }
    }

    return NextResponse.json({ success: true, updated });
  } catch (err: any) {
    const safeErr = formatSafeError(err);
    return NextResponse.json(safeErr, { status: 500 });
  }
}
