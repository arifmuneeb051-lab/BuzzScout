import { NextResponse } from "next/server";
import { formatSafeError } from "@/lib/security";
import { revalidatePath } from "next/cache";
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
    const safeErr = formatSafeError(err);
    return NextResponse.json(safeErr, { status: 500 });
  }
}

export async function POST(req: Request) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized admin access" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      heroHeadline,
      heroSubtitle,
      announcementText,
      ctaButtonText,
      telegramBotUrl,
      telegramBotToken,
      supportEmail,
      monthlyPrice,
      ltdPrice,
      agencyPrice,
      stripeSecretKey,
      stripePublishableKey,
      stripePaymentLink,
      stripeMonthlyLink,
      stripeLtdLink,
      stripeAgencyLink,
      stripeWebhookSecret,
      paymentMode,
    } = body;

    const updated = await prisma.siteConfig.upsert({
      where: { id: "default" },
      update: {
        ...(heroHeadline ? { heroHeadline } : {}),
        ...(heroSubtitle ? { heroSubtitle } : {}),
        ...(announcementText ? { announcementText } : {}),
        ...(ctaButtonText ? { ctaButtonText } : {}),
        ...(telegramBotUrl ? { telegramBotUrl } : {}),
        ...(telegramBotToken !== undefined ? { telegramBotToken } : {}),
        ...(supportEmail ? { supportEmail } : {}),
        trialDays: 0,
        ...(monthlyPrice !== undefined ? { monthlyPrice: Number(monthlyPrice) } : {}),
        ...(ltdPrice !== undefined ? { ltdPrice: Number(ltdPrice) } : {}),
        ...(agencyPrice !== undefined ? { agencyPrice: Number(agencyPrice) } : {}),
        ...(stripeSecretKey !== undefined ? { stripeSecretKey } : {}),
        ...(stripePublishableKey !== undefined ? { stripePublishableKey } : {}),
        ...(stripePaymentLink !== undefined ? { stripePaymentLink } : {}),
        ...(stripeMonthlyLink !== undefined ? { stripeMonthlyLink } : {}),
        ...(stripeLtdLink !== undefined ? { stripeLtdLink } : {}),
        ...(stripeAgencyLink !== undefined ? { stripeAgencyLink } : {}),
        ...(stripeWebhookSecret !== undefined ? { stripeWebhookSecret } : {}),
        ...(paymentMode !== undefined ? { paymentMode } : {}),
      },
      create: {
        id: "default",
        heroHeadline: heroHeadline || "Turn Social Conversations Into High-Paying Verified Buyers 2026.",
        heroSubtitle: heroSubtitle || "Monitor high-intent phrases like 'looking for alternative to X' or 'recommend tool for Y'. Get instant mobile alerts on Telegram & Discord with ready-to-pitch AI replies in under 60 seconds.",
        announcementText: announcementText || "Disrupting Traditional Monitors — Claim $49 Lifetime Access Now",
        ctaButtonText: ctaButtonText || "Launch Radar",
        telegramBotUrl: telegramBotUrl || "https://t.me/BotFather",
        telegramBotToken: telegramBotToken || null,
        supportEmail: supportEmail || "support@buzzscout.io",
        trialDays: 0,
        monthlyPrice: Number(monthlyPrice) || 9,
        ltdPrice: Number(ltdPrice) || 49,
        agencyPrice: Number(agencyPrice) || 79,
        stripeSecretKey: stripeSecretKey || null,
        stripePublishableKey: stripePublishableKey || null,
        stripePaymentLink: stripePaymentLink || null,
        stripeMonthlyLink: stripeMonthlyLink || null,
        stripeLtdLink: stripeLtdLink || null,
        stripeAgencyLink: stripeAgencyLink || null,
        stripeWebhookSecret: stripeWebhookSecret || null,
        paymentMode: paymentMode || "TEST",
      },
    });

    try {
      revalidatePath("/");
      revalidatePath("/admin/settings");
    } catch {
      // ignore in environments where revalidatePath is no-op
    }

    return NextResponse.json({ success: true, config: updated });
  } catch (err: any) {
    const safeErr = formatSafeError(err);
    return NextResponse.json(safeErr, { status: 500 });
  }
}
