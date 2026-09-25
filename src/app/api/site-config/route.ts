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
    const [config, ltdUsersCount] = await Promise.all([
      prisma.siteConfig.findUnique({
        where: { id: "default" },
      }),
      prisma.user.count({
        where: { plan: "LTD", planStatus: "ACTIVE" }
      })
    ]);

    const ltdMaxSlots = 100;
    const ltdSoldOut = ltdUsersCount >= ltdMaxSlots;

    if (!config) {
      return NextResponse.json(
        {
          heroHeadline: "Turn Social Conversations Into High-Paying Verified Buyers 2026.",
          heroSubtitle: "Monitor high-intent phrases like 'looking for alternative to X' or 'recommend tool for Y'. Get instant alerts on Telegram & Discord with ready-to-pitch AI replies in under 60 seconds.",
          announcementText: "Disrupting Traditional Monitors — Claim $49 Lifetime Access Now",
          ctaButtonText: "Launch Radar",
          telegramBotUrl: "https://t.me/BotFather",
          supportEmail: "support@buzzscout.io",
          monthlyPrice: 9,
          ltdPrice: 49,
          ltdOfferActive: true,
          agencyPrice: 79,
          ltdUsersCount,
          ltdMaxSlots,
          ltdSoldOut,
        },
        { headers }
      );
    }

    const { stripeSecretKey, stripeWebhookSecret, telegramBotToken, ...safeConfig } = config;
    return NextResponse.json({
      ...safeConfig,
      ltdUsersCount,
      ltdMaxSlots,
      ltdSoldOut,
      // If sold out, we can choose to force it inactive, but we'll let frontend show "Sold Out" UI instead.
    }, { headers });
  } catch (err: any) {
    return NextResponse.json(
      {
        heroHeadline: "Turn Social Conversations Into High-Paying Verified Buyers 2026.",
        heroSubtitle: "Monitor high-intent phrases like 'looking for alternative to X' or 'recommend tool for Y'. Get instant alerts on Telegram & Discord with ready-to-pitch AI replies in under 60 seconds.",
        announcementText: "Disrupting Traditional Monitors — Claim $49 Lifetime Access Now",
        ctaButtonText: "Launch Radar",
        telegramBotUrl: "https://t.me/BotFather",
        supportEmail: "support@buzzscout.io",
        monthlyPrice: 9,
        ltdPrice: 49,
        ltdOfferActive: true,
        agencyPrice: 79,
        ltdUsersCount: 0,
        ltdMaxSlots: 100,
        ltdSoldOut: false,
      },
      { status: 200, headers }
    );
  }
}
