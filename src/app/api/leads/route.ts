import { NextResponse } from "next/server";
import { formatSafeError } from "@/lib/security";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isPlanActive = user.role === "ADMIN" || user.planStatus === "ACTIVE";
  if (!isPlanActive) {
    return NextResponse.json(
      { error: "Error 403 Forbidden: Active subscription plan required to access leads feed.", upgradeRequired: true },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const platform = searchParams.get("platform");
    const intentScore = searchParams.get("intentScore");
    const status = searchParams.get("status");
    const keywordId = searchParams.get("keywordId");

    const where: any = { userId: user.id };

    if (platform && platform !== "ALL") {
      where.platform = platform;
    }
    if (intentScore && intentScore !== "ALL") {
      where.intentScore = intentScore;
    }
    if (status && status !== "ALL") {
      where.status = status;
    }
    if (keywordId && keywordId !== "ALL") {
      where.keywordId = keywordId;
    }

    const leads = await prisma.lead.findMany({
      where,
      orderBy: { detectedAt: "desc" },
      take: 100,
      include: {
        keyword: {
          select: { phrase: true },
        },
      },
    });

    return NextResponse.json({ leads });
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
    const { id, status, pitchDraft } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Lead ID is required" }, { status: 400 });
    }

    const data: any = {};
    if (status) data.status = status;
    if (pitchDraft !== undefined) data.pitchDraft = pitchDraft;

    const lead = await prisma.lead.updateMany({
      where: { id, userId: user.id },
      data,
    });

    if (lead.count === 0) {
      const existsForOther = await prisma.lead.findFirst({ where: { id } });
      if (existsForOther && existsForOther.userId !== user.id) {
        const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "127.0.0.1";
        const { logSecurityEvent } = await import("@/lib/audit-logger");
        await logSecurityEvent({
          eventType: "IDOR_ATTEMPT_DETECTED",
          userId: user.id,
          email: user.email,
          ipAddress: ip,
          details: `Unauthorized attempt to modify lead [${id}] belonging to another user`,
          severity: "CRITICAL",
        });
      }
    }

    return NextResponse.json({ success: true, lead });
  } catch (err: any) {
    const safeErr = formatSafeError(err);
    return NextResponse.json(safeErr, { status: 500 });
  }
}
