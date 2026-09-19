import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const channels = await prisma.alertChannel.findMany({
      where: { userId: user.id },
    });

    return NextResponse.json({ channels });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { type, telegramBotToken, telegramChatId, discordWebhookUrl, active } = await req.json();

    if (!type || !["TELEGRAM", "DISCORD"].includes(type)) {
      return NextResponse.json({ error: "Valid channel type (TELEGRAM or DISCORD) required" }, { status: 400 });
    }

    // Check if channel already exists for this type
    const existing = await prisma.alertChannel.findFirst({
      where: { userId: user.id, type },
    });

    if (existing) {
      const updated = await prisma.alertChannel.update({
        where: { id: existing.id },
        data: {
          telegramBotToken: telegramBotToken ?? existing.telegramBotToken,
          telegramChatId: telegramChatId ?? existing.telegramChatId,
          discordWebhookUrl: discordWebhookUrl ?? existing.discordWebhookUrl,
          active: active !== undefined ? Boolean(active) : existing.active,
        },
      });
      return NextResponse.json({ success: true, channel: updated });
    }

    const channel = await prisma.alertChannel.create({
      data: {
        userId: user.id,
        type,
        telegramBotToken,
        telegramChatId,
        discordWebhookUrl,
        active: active !== undefined ? Boolean(active) : true,
      },
    });

    return NextResponse.json({ success: true, channel });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
