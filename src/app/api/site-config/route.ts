import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const config = await prisma.siteConfig.findUnique({
      where: { id: "default" },
    });

    if (!config) {
      return NextResponse.json({
        heroHeadline: "Turn Reddit & X Conversations Into Paying Customers on Autopilot.",
        heroSubtitle: "Monitor high-intent phrases like 'looking for alternative to X' or 'recommend tool for Y'. Get instant alerts on Telegram & Discord with ready-to-pitch AI replies in under 60 seconds.",
        announcementText: "Stop paying $100+/month for legacy enterprise monitors — Claim $39 Lifetime Access",
        trialDays: 7,
        monthlyPrice: 9,
        ltdPrice: 39,
        agencyPrice: 79,
      });
    }

    return NextResponse.json(config);
  } catch (err: any) {
    return NextResponse.json(
      {
        heroHeadline: "Turn Reddit & X Conversations Into Paying Customers on Autopilot.",
        heroSubtitle: "Monitor high-intent phrases like 'looking for alternative to X' or 'recommend tool for Y'. Get instant alerts on Telegram & Discord with ready-to-pitch AI replies in under 60 seconds.",
        announcementText: "Stop paying $100+/month for legacy enterprise monitors — Claim $39 Lifetime Access",
        trialDays: 7,
        monthlyPrice: 9,
        ltdPrice: 39,
        agencyPrice: 79,
      },
      { status: 200 }
    );
  }
}
