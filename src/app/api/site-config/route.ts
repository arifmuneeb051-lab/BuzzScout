import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const headers = {
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    "Pragma": "no-cache",
    "Expires": "0",
  };

  try {
    const config = await prisma.siteConfig.findUnique({
      where: { id: "default" },
    });

    if (!config) {
      return NextResponse.json(
        {
          heroHeadline: "Turn Social Conversations Into High-Paying Verified Buyers 2026.",
          heroSubtitle: "Monitor high-intent phrases like 'looking for alternative to X' or 'recommend tool for Y'. Get instant alerts on Telegram & Discord with ready-to-pitch AI replies in under 60 seconds.",
          announcementText: "Disrupting Traditional Monitors — Claim $25 Lifetime Access Now",
          ctaButtonText: "Launch Radar",
          telegramBotUrl: "https://t.me/BotFather",
          supportEmail: "support@buzzscout.io",
          monthlyPrice: 5,
          ltdPrice: 25,
          agencyPrice: 79,
        },
        { headers }
      );
    }

    const { stripeSecretKey, stripeWebhookSecret, telegramBotToken, ...safeConfig } = config;
    return NextResponse.json(safeConfig, { headers });
  } catch (err: any) {
    return NextResponse.json(
      {
        heroHeadline: "Turn Social Conversations Into High-Paying Verified Buyers 2026.",
        heroSubtitle: "Monitor high-intent phrases like 'looking for alternative to X' or 'recommend tool for Y'. Get instant alerts on Telegram & Discord with ready-to-pitch AI replies in under 60 seconds.",
        announcementText: "Disrupting Traditional Monitors — Claim $25 Lifetime Access Now",
        ctaButtonText: "Launch Radar",
        telegramBotUrl: "https://t.me/BotFather",
        supportEmail: "support@buzzscout.io",
        monthlyPrice: 5,
        ltdPrice: 25,
        agencyPrice: 79,
      },
      { status: 200, headers }
    );
  }
}
