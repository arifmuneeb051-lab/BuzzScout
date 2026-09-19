import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized admin access" }, { status: 401 });
  }

  try {
    const config = await prisma.siteConfig.findUnique({
      where: { id: "default" },
    });

    return NextResponse.json({ success: true, config });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized admin access" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { heroHeadline, heroSubtitle, announcementText, trialDays, monthlyPrice, ltdPrice, agencyPrice } = body;

    const updated = await prisma.siteConfig.upsert({
      where: { id: "default" },
      update: {
        ...(heroHeadline ? { heroHeadline } : {}),
        ...(heroSubtitle ? { heroSubtitle } : {}),
        ...(announcementText ? { announcementText } : {}),
        ...(trialDays !== undefined ? { trialDays: Number(trialDays) } : {}),
        ...(monthlyPrice !== undefined ? { monthlyPrice: Number(monthlyPrice) } : {}),
        ...(ltdPrice !== undefined ? { ltdPrice: Number(ltdPrice) } : {}),
        ...(agencyPrice !== undefined ? { agencyPrice: Number(agencyPrice) } : {}),
      },
      create: {
        id: "default",
        heroHeadline: heroHeadline || "Turn Reddit & X Conversations Into Paying Customers on Autopilot.",
        heroSubtitle: heroSubtitle || "Monitor high-intent phrases like 'looking for alternative to X' or 'recommend tool for Y'. Get instant alerts on Telegram & Discord with ready-to-pitch AI replies in under 60 seconds.",
        announcementText: announcementText || "Stop paying $100+/month for legacy enterprise monitors — Claim $39 Lifetime Access",
        trialDays: Number(trialDays) || 7,
        monthlyPrice: Number(monthlyPrice) || 9,
        ltdPrice: Number(ltdPrice) || 39,
        agencyPrice: Number(agencyPrice) || 79,
      },
    });

    return NextResponse.json({ success: true, config: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
