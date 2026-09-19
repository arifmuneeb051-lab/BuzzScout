export interface TelegramAlertPayload {
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

export async function sendTelegramAlert(payload: TelegramAlertPayload): Promise<{ success: boolean; error?: string }> {
  const { botToken, chatId, lead } = payload;

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
    if (!data.ok) {
      return { success: false, error: data.description || "Telegram API error" };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Network error sending Telegram message" };
  }
}

export async function testTelegramConnection(botToken: string, chatId: string): Promise<{ success: boolean; message: string }> {
  try {
    const testText = `✅ <b>SignalPulse Connected!</b>\n\nYour Telegram alert channel is now verified and active. You will receive real-time notifications here whenever high-intent buyer leads are detected on Reddit and X!`;
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: testText,
        parse_mode: "HTML",
      }),
    });

    const data = await res.json();
    if (!data.ok) {
      return { success: false, message: data.description || "Failed to send test message to Telegram." };
    }
    return { success: true, message: "Test alert successfully sent to Telegram!" };
  } catch (err: any) {
    return { success: false, message: err?.message || "Failed to reach Telegram API." };
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
