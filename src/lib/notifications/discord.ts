import { prisma } from "@/lib/db";
import { discordBreaker, withExponentialBackoff } from "@/lib/resilience/circuit-breaker";

export interface DiscordAlertPayload {
  channelId?: string;
  webhookUrl: string;
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

export async function sendDiscordAlert(payload: DiscordAlertPayload): Promise<{ success: boolean; error?: string; status?: number }> {
  const { channelId, webhookUrl, lead } = payload;

  if (!webhookUrl || !webhookUrl.startsWith("http")) {
    if (channelId) {
      await prisma.alertChannel.update({
        where: { id: channelId },
        data: {
          active: false,
          lastError: "Malformed Discord webhook URL. Protocol must be http/https.",
          errorCount: { increment: 1 },
        },
      }).catch(() => {});
    }
    return { success: false, error: "Malformed Discord webhook URL" };
  }

  // Discord Embed Color: High Intent = 0xff4500 (Reddit Orange), Medium = 0x6366f1 (Indigo)
  const color = lead.intentScore === "HIGH" ? 0xff4500 : lead.intentScore === "MEDIUM" ? 0x6366f1 : 0x3b82f6;
  const platformName = lead.platform === "REDDIT" ? "Reddit" : "X (Twitter)";
  const location = lead.subreddit ? `r/${lead.subreddit}` : lead.platform;

  const embed: any = {
    title: `🎯 ${lead.intentScore} Intent Lead: "${lead.title.slice(0, 100)}"`,
    url: lead.url,
    color,
    description: `"${lead.content.slice(0, 350)}${lead.content.length > 350 ? "..." : ""}"`,
    fields: [
      {
        name: "Platform / Location",
        value: `${platformName} (${location})`,
        inline: true,
      },
      {
        name: "Trigger Keyword",
        value: `\`${lead.keyword}\``,
        inline: true,
      },
      {
        name: "Author",
        value: lead.author,
        inline: true,
      },
    ],
    footer: {
      text: "BuzzScout • Real-time Buyer Radar",
    },
    timestamp: new Date().toISOString(),
  };

  if (lead.pitchDraft) {
    embed.fields.push({
      name: "💡 Recommended Pitch Angle",
      value: `\`\`\`${lead.pitchDraft.slice(0, 500)}\`\`\``,
      inline: false,
    });
  }

  try {
    return await discordBreaker.execute(async () => {
      return await withExponentialBackoff(async (attempt) => {
        const res = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: "BuzzScout Radar",
            avatar_url: "https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/radar.png",
            content: `🚨 **New Buyer Lead Alert for keyword \`${lead.keyword}\`**`,
            embeds: [embed],
          }),
        });

        // Edge Case: Discord Webhook 404 (deleted/expired) or 400 (malformed/unknown webhook)
        if (res.status === 404 || res.status === 400 || res.status === 401) {
          const errText = await res.text();
          if (channelId) {
            await prisma.alertChannel.update({
              where: { id: channelId },
              data: {
                active: false,
                lastError: `Discord Webhook Inactive (HTTP ${res.status}): ${errText.slice(0, 120)}`,
                errorCount: { increment: 1 },
              },
            }).catch(() => {});
          }
          return { success: false, status: res.status, error: `Discord Webhook Invalid/Deleted (HTTP ${res.status}): ${errText}` };
        }

        // Retryable rate limit or server error
        if (res.status === 429 || res.status >= 500) {
          const error: any = new Error(`Discord transient HTTP ${res.status}`);
          error.status = res.status;
          error.retryAfter = res.headers.get("retry-after");
          throw error;
        }

        if (!res.ok) {
          const errText = await res.text();
          return { success: false, status: res.status, error: `Discord error: ${errText}` };
        }

        return { success: true, status: 200 };
      }, { maxRetries: 2, initialDelayMs: 400 });
    });
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to send Discord webhook" };
  }
}

export async function testDiscordWebhook(webhookUrl: string, channelId?: string): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "BuzzScout Radar",
        content: "✅ **BuzzScout Connected!** Your Discord webhook is properly configured and will receive instant lead alerts.",
      }),
    });

    if (res.status === 404 || res.status === 400 || res.status === 401) {
      if (channelId) {
        await prisma.alertChannel.update({
          where: { id: channelId },
          data: {
            active: false,
            lastError: `Webhook rejected with HTTP ${res.status}. Webhook may be expired or deleted.`,
            errorCount: { increment: 1 },
          },
        }).catch(() => {});
      }
      return { success: false, message: `Discord rejected webhook URL (HTTP ${res.status}). Please check or recreate the webhook.` };
    }

    if (!res.ok) {
      return { success: false, message: "Discord rejected the webhook URL. Please verify the URL." };
    }

    return { success: true, message: "Test alert successfully sent to Discord!" };
  } catch (err: any) {
    return { success: false, message: err?.message || "Could not connect to Discord webhook." };
  }
}