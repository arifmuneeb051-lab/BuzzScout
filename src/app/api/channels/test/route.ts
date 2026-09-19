import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
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
      if (!botToken || !chatId) {
        return NextResponse.json({ error: "Bot token and Chat ID are required" }, { status: 400 });
      }
      const res = await testTelegramConnection(botToken, chatId);
      return NextResponse.json(res, { status: res.success ? 200 : 400 });
    }

    if (type === "DISCORD") {
      if (!webhookUrl) {
        return NextResponse.json({ error: "Discord webhook URL is required" }, { status: 400 });
      }
      const res = await testDiscordWebhook(webhookUrl);
      return NextResponse.json(res, { status: res.success ? 200 : 400 });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
