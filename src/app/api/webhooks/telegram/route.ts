import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    if (body.message && body.message.text) {
      const text = body.message.text;
      const chatId = body.message.chat.id.toString();

      // Deep link command format: /start <userId>
      if (text.startsWith("/start ")) {
        const userId = text.split(" ")[1];
        
        if (userId) {
          const user = await prisma.user.findUnique({ where: { id: userId } });
          if (user) {
            const existingChannel = await prisma.alertChannel.findFirst({
              where: { userId, type: "TELEGRAM" }
            });

            if (existingChannel) {
              await prisma.alertChannel.update({
                where: { id: existingChannel.id },
                data: { telegramChatId: chatId, active: true, telegramBotToken: null }
              });
            } else {
              await prisma.alertChannel.create({
                data: {
                  userId,
                  type: "TELEGRAM",
                  telegramChatId: chatId,
                  active: true
                }
              });
            }

            const botToken = process.env.TELEGRAM_BOT_TOKEN;
            if (botToken) {
              await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  chat_id: chatId,
                  text: "✅ Great! Your Telegram account is now successfully linked to BuzzScout. You will receive real-time lead alerts here."
                })
              });
            }
          }
        }
      }
    }
    
    // Always return 200 OK so Telegram doesn't retry
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Telegram webhook error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
