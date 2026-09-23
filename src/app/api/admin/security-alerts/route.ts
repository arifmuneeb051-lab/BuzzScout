import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminUser } from "@/lib/auth";

export async function GET() {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access: Master Owner only." }, { status: 401 });
    }

    const alerts = await prisma.securityAlert.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const totalAlerts = await prisma.securityAlert.count();
    const criticalCount = await prisma.securityAlert.count({
      where: { severity: "CRITICAL" },
    });
    const unauthorizedCount = await prisma.securityAlert.count({
      where: { eventType: "UNAUTHORIZED_ADMIN_ATTEMPT" },
    });
    const blockedIpCount = await prisma.blockedIp.count();

    return NextResponse.json({
      alerts,
      summary: {
        totalAlerts,
        criticalCount,
        unauthorizedCount,
        blockedIpCount,
      },
    });
  } catch (err: any) {
    console.error("Failed to retrieve security alerts:", err);
    return NextResponse.json({ error: "Failed to fetch security alerts" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { alertId, action } = await req.json();

    if (action === "CLEAR_ALL") {
      await prisma.securityAlert.updateMany({
        where: { resolved: false },
        data: { resolved: true },
      });
      return NextResponse.json({ success: true, message: "All security alerts marked resolved." });
    }

    if (alertId) {
      await prisma.securityAlert.update({
        where: { id: alertId },
        data: { resolved: true },
      });
      return NextResponse.json({ success: true, message: "Alert resolved." });
    }

    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  } catch (err: any) {
    console.error("Failed to update security alert:", err);
    return NextResponse.json({ error: "Failed to update alert" }, { status: 500 });
  }
}
