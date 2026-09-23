import { NextResponse } from "next/server";
import { formatSafeError } from "@/lib/security";
import { getAdminUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized admin access" }, { status: 401 });
  }

  try {
    const [totalUsers, trialUsers, ltdUsers, proUsers, totalLeads, totalKeywords, totalLicenses] =
      await Promise.all([
        prisma.user.count({ where: { role: "USER" } }),
        prisma.user.count({ where: { role: "USER", plan: { in: ["TRIAL", "INACTIVE"] } } }),
        prisma.user.count({ where: { role: "USER", plan: "LTD" } }),
        prisma.user.count({ where: { role: "USER", plan: "PRO" } }),
        prisma.lead.count(),
        prisma.keyword.count(),
        prisma.licenseKey.count(),
      ]);

    const recentUsers = await prisma.user.findMany({
      where: { role: "USER" },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        planStatus: true,
        createdAt: true,
        _count: {
          select: { keywords: true, leads: true },
        },
      },
    });

    const highIntentLeadsCount = await prisma.lead.count({
      where: { intentScore: "HIGH" },
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        trialUsers,
        ltdUsers,
        proUsers,
        totalLeads,
        highIntentLeadsCount,
        totalKeywords,
        totalLicenses,
        estimatedRevenue: ltdUsers * 35 + proUsers * 5,
      },
      recentUsers,
    });
  } catch (err: any) {
    const safeErr = formatSafeError(err);
    return NextResponse.json(safeErr, { status: 500 });
  }
}
