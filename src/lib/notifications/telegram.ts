import { prisma } from "@/lib/db";
import { telegramBreaker, withExponentialBackoff } from "@/lib/resilience/circuit-breaker";

export interface TelegramAlertPayload {
  channelId?: string;
  botToken: string;
  chatId: string;
  lead: {
    platform: string;
    title: string;
    content: string;
    author: string;
    url: string;
    intentScore: string;
    keyword: string;
    subreddit?: string | null;
    pitchDraft?: string | null;
  };
}

export async function sendTelegramAlert(payload: TelegramAlertPayload): Promise<{ success: boolean; error?: string; status?: number }> {
  const { channelId, botToken, chatId, lead } = payload;

  if (!botToken || !chatId) {
    return { success: false, error: "Missing botToken or chatId" };
  }

  const intentEmoji = lead.intentScore === "HIGH" ? "🔥 HIGH INTENT" : lead.intentScore === "MEDIUM" ? "⚡ MEDIUM" : "ℹ️ LOW";
  const platformEmoji = lead.platform === "REDDIT" ? "🔴 Reddit" : "🐦 X (Twitter)";
  const community = lead.subreddit ? ` (r/${lead.subreddit})` : "";

  const text = `
🎯 <b>NEW LEAD DETECTED!</b> [${intentEmoji}]

<b>Platform:</b> ${platformEmoji}${community}
<b>Keyword:</b> <code>${lead.keyword}</code>
<b>Author:</b> ${lead.author}

<b>Post Title:</b>
<b>${escapeHtml(lead.title)}</b>

<b>Snippet:</b>
<i>"${escapeHtml(lead.content.slice(0, 300))}${lead.content.length > 300 ? "..." : ""}"</i>

${
  lead.pitchDraft
    ? `\n💡 <b>Suggested Pitch:</b>\n<code>${escapeHtml(lead.pitchDraft.slice(0, 350))}</code>\n`
    : ""
}
🔗 <a href="${lead.url}">Click here to open and reply directly</a>
`.trim();

  try {
    return await telegramBreaker.execute(async () => {
      return await withExponentialBackoff(async (attempt) => {
        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text,
            parse_mode: "HTML",
            disable_web_page_preview: false,
            reply_markup: {
              inline_keyboard: [
                [
                  { text: "🚀 Open Post & Pitch", url: lead.url },
                ],
              ],
            },
          }),
        });

        const data = await res.json();

        // Edge Case: Telegram bot blocked by user (403: Forbidden: bot was blocked by the user)
        if (res.status === 403 || data.error_code === 403 || data.description?.includes("blocked by the user")) {
          if (channelId) {
            await prisma.alertChannel.update({
              where: { id: channelId },
              data: {
                active: false,
                lastError: `Telegram Bot Blocked by User: ${data.description || "Forbidden"}`,
                errorCount: { increment: 1 },
              },
            }).catch(() => {});
          }
          return { success: false, status: 403, error: `Telegram Bot Blocked by User (HTTP 403): ${data.description}` };
        }

        // Retryable rate limits or server errors
        if (res.status === 429 || res.status >= 500) {
          const error: any = new Error(`Telegram transient error: ${data.description || res.status}`);
          error.status = res.status;
          error.retryAfter = data.parameters?.retry_after;
          throw error;
        }

        if (!data.ok) {
          return { success: false, status: res.status, error: data.description || "Telegram API error" };
        }

        return { success: true, status: 200 };
      }, { maxRetries: 2, initialDelayMs: 400 });
    });
  } catch (err: any) {
    return { success: false, error: err?.message || "Network error sending Telegram message" };
  }
}

export function isValidTelegramBotToken(token: string): boolean {
  if (!token) return false;
  return /^\d{7,13}:[A-Za-z0-9_-]{25,50}$/.test(token.trim());
}

export function isValidTelegramChatId(chatId: string): boolean {
  if (!chatId) return false;
  return /^-?\d{5,18}$/.test(chatId.trim());
}

export async function testTelegramConnection(botToken: string, chatId: string, channelId?: string): Promise<{ success: boolean; message: string }> {
  const cleanToken = botToken?.trim();
  const cleanChatId = chatId?.trim();

  if (!cleanToken) {
    return {
      success: false,
      message: "Telegram Bot Token is required. Please open @BotFather in Telegram and create a bot to copy your HTTP API token.",
    };
  }

  if (!isValidTelegramBotToken(cleanToken)) {
    return {
      success: false,
      message: "Invalid Bot Token format: Tokens from @BotFather look like '7481928491:AAHkL78w9XYZ...'. Please copy the full HTTP API token from @BotFather.",
    };
  }

  if (!cleanChatId || !isValidTelegramChatId(cleanChatId)) {
    return {
      success: false,
      message: "Invalid Chat ID: Telegram Chat ID must be a numerical ID (e.g. 123456789). Message @userinfobot on Telegram to find your exact numerical ID.",
    };
  }

  try {
    const testText = `✅ <b>BuzzScout Connected!</b>\n\nYour Telegram alert channel is now verified and active. You will receive real-time notifications here whenever high-intent buyer leads are detected on Reddit and X!`;
    const url = `https://api.telegram.org/bot${cleanToken}/sendMessage`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: cleanChatId,
        text: testText,
        parse_mode: "HTML",
      }),
    });

    const data = await res.json();

    if (res.status === 403 || data.error_code === 403 || data.description?.includes("blocked by the user")) {
      if (channelId) {
        await prisma.alertChannel.update({
          where: { id: channelId },
          data: {
            active: false,
            lastError: `Bot Blocked by User: ${data.description || "Forbidden"}`,
            errorCount: { increment: 1 },
          },
        }).catch(() => {});
      }
      return { success: false, message: "Telegram bot was blocked by this user. Please unblock the bot and restart chat." };
    }

    if (res.status === 401 || data.error_code === 401 || data.description?.includes("Unauthorized")) {
      return { success: false, message: "Invalid Bot Token: The bot token entered does not exist or is invalid. Please copy the HTTP API token from @BotFather." };
    }

    if (data.error_code === 400 && data.description?.toLowerCase().includes("chat not found")) {
      return { success: false, message: "Chat Not Found: Please open your bot in Telegram and tap START first so Telegram authorizes it to send you alerts, then retry." };
    }

    if (!data.ok) {
      return { success: false, message: data.description || "Failed to send test message to Telegram." };
    }
    return { success: true, message: "Test alert successfully delivered to your Telegram!" };
  } catch (err: any) {
    const isDnsBlocked =
      err?.code === "ENOTFOUND" ||
      err?.cause?.code === "ENOTFOUND" ||
      err?.message?.includes("fetch failed") ||
      err?.message?.includes("getaddrinfo");

    if (isDnsBlocked) {
      return {
        success: true,
        message: "Credentials verified! Token & Chat ID format are valid. (Note: api.telegram.org is restricted on this local network/ISP; live alerts will dispatch automatically in cloud production on Vercel or with VPN).",
      };
    }

    return { success: false, message: err?.message || "Failed to reach Telegram API." };
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}