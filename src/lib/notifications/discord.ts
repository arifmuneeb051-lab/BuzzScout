export interface DiscordAlertPayload {
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

export async function sendDiscordAlert(payload: DiscordAlertPayload): Promise<{ success: boolean; error?: string }> {
  const { webhookUrl, lead } = payload;

  if (!webhookUrl) {
    return { success: false, error: "Missing Discord webhook URL" };
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
      text: "SignalPulse • Real-time Buyer Radar",
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
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "SignalPulse Radar",
        avatar_url: "https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/radar.png",
        content: `🚨 **New Buyer Lead Alert for keyword \`${lead.keyword}\`**`,
        embeds: [embed],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return { success: false, error: `Discord error: ${errText}` };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to send Discord webhook" };
  }
}

export async function testDiscordWebhook(webhookUrl: string): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "SignalPulse Radar",
        content: "✅ **SignalPulse Connected!** Your Discord webhook is properly configured and will receive instant lead alerts.",
      }),
    });

    if (!res.ok) {
      return { success: false, message: "Discord rejected the webhook URL. Please verify the URL." };
    }

    return { success: true, message: "Test alert successfully sent to Discord!" };
  } catch (err: any) {
    return { success: false, message: err?.message || "Could not connect to Discord webhook." };
  }
}
