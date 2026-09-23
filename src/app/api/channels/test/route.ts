import { NextResponse } from "next/server";
import { formatSafeError } from "@/lib/security";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { testTelegramConnection } from "@/lib/notifications/telegram";
import { testDiscordWebhook } from "@/lib/notifications/discord";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { type, botToken, chatId, webhookUrl } = await req.json();

    if (type === "TELEGRAM") {
      if (!chatId) {
        return NextResponse.json({ error: "Telegram Chat ID is required" }, { status: 400 });
      }

      let activeToken = botToken;
      let existingChannelId: string | undefined;

      // Check existing channel if botToken wasn't passed directly
      const existingChannel = await prisma.alertChannel.findFirst({
        where: { userId: user.id, type: "TELEGRAM" },
      });
      if (existingChannel) {
        existingChannelId = existingChannel.id;
        if (!activeToken) {
          activeToken = existingChannel.telegramBotToken || undefined;
        }
      }

      // Fallback to platform-wide bot token (SiteConfig or env)
      if (!activeToken) {
        const siteConfig = await prisma.siteConfig.findUnique({ where: { id: "default" } }).catch(() => null);
        activeToken = siteConfig?.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN;
      }

      if (!activeToken) {
        return NextResponse.json({
          success: false,
          message: "Telegram Bot Token is required to send real alerts. Please create a bot with @BotFather in 30 seconds and enter your Bot Token.",
        }, { status: 400 });
      }

      const res = await testTelegramConnection(activeToken, chatId, existingChannelId);
      return NextResponse.json(res, { status: res.success ? 200 : 400 });
    }

    if (type === "DISCORD") {
      let targetUrl = webhookUrl;
      if (!targetUrl) {
        const existingDiscord = await prisma.alertChannel.findFirst({
          where: { userId: user.id, type: "DISCORD" },
        });
        targetUrl = existingDiscord?.discordWebhookUrl || undefined;
      }
      if (!targetUrl) {
        return NextResponse.json({ error: "Discord webhook URL is required" }, { status: 400 });
      }
      const res = await testDiscordWebhook(targetUrl);
      return NextResponse.json(res, { status: res.success ? 200 : 400 });
    }

    return NextResponse.json({ error: "Invalid channel type" }, { status: 400 });
  } catch (err: any) {
    const safeErr = formatSafeError(err);
    return NextResponse.json(safeErr, { status: 500 });
  }
}
