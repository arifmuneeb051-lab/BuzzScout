import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access: Master Owner only." }, { status: 401 });
    }

    const { ipAddress, alertId, action = "BLOCK" } = await req.json();

    if (!ipAddress) {
      return NextResponse.json({ error: "IP address is required" }, { status: 400 });
    }

    if (action === "BLOCK") {
      // Add to BlockedIp table
      await prisma.blockedIp.upsert({
        where: { ipAddress },
        update: { reason: "Permanently blocked by Master Admin" },
        create: {
          ipAddress,
          reason: "Permanently blocked by Master Admin",
          blockedBy: admin.email,
        },
      });

      // Update security alerts with this IP
      await prisma.securityAlert.updateMany({
        where: { ipAddress },
        data: { ipBlocked: true },
      });

      return NextResponse.json({
        success: true,
        message: `IP ${ipAddress} has been permanently blacklisted and blocked.`,
      });
    } else if (action === "UNBLOCK") {
      // Remove from BlockedIp table
      await prisma.blockedIp.deleteMany({
        where: { ipAddress },
      });

      // Update security alerts with this IP
      await prisma.securityAlert.updateMany({
        where: { ipAddress },
        data: { ipBlocked: false },
      });

      return NextResponse.json({
        success: true,
        message: `IP ${ipAddress} has been unblocked.`,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error("Failed to block/unblock IP:", err);
    return NextResponse.json({ error: "Failed to process block request" }, { status: 500 });
  }
}
