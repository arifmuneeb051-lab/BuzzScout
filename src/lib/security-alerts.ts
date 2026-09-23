import { prisma } from "./db";

export interface SecurityIncidentParams {
  ipAddress: string;
  userAgent?: string | null;
  attemptedEmail: string;
  eventType: "UNAUTHORIZED_ADMIN_ATTEMPT" | "BRUTE_FORCE_BLOCKED" | "TAMPER_PROBE" | "INVALID_CREDENTIALS";
  severity?: "MEDIUM" | "HIGH" | "CRITICAL";
  details?: string;
}

export async function recordSecurityIncident(params: SecurityIncidentParams) {
  try {
    const alert = await prisma.securityAlert.create({
      data: {
        ipAddress: params.ipAddress,
        userAgent: params.userAgent?.slice(0, 255) || "Unknown",
        attemptedEmail: params.attemptedEmail.slice(0, 100),
        eventType: params.eventType,
        severity: params.severity || "HIGH",
        details: params.details || "Unauthorized admin gateway access attempt detected",
      },
    });

    console.warn(
      `🚨 [SECURITY ALERT - ${params.severity || "HIGH"}]: Intrusion attempt by [REDACTED_EMAIL] from IP ${params.ipAddress} (${params.eventType})`
    );

    // If active Discord or Telegram channels exist for the admin, dispatch instant notification
    try {
      const channels = await prisma.alertChannel.findMany({
        where: { active: true },
      });

      for (const ch of channels) {
        if (ch.type === "DISCORD" && ch.discordWebhookUrl) {
          fetch(ch.discordWebhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              content: `🚨 **SECURITY WARNING**: Unauthorized attempt to access Master Admin Portal!\n**Target Email**: \`${params.attemptedEmail}\`\n**Intruder IP**: \`${params.ipAddress}\`\n**Severity**: ${params.severity || "HIGH"}\n**Timestamp**: ${new Date().toISOString()}`,
            }),
          }).catch(() => {});
        } else if (ch.type === "TELEGRAM" && ch.telegramBotToken && ch.telegramChatId) {
          fetch(`https://api.telegram.org/bot${ch.telegramBotToken}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: ch.telegramChatId,
              text: `🚨 [SECURITY WARNING]: Unauthorized access attempt on Admin Portal!\nTarget Email: ${params.attemptedEmail}\nIntruder IP: ${params.ipAddress}\nEvent: ${params.eventType}`,
            }),
          }).catch(() => {});
        }
      }
    } catch (notifyErr) {
      console.error("Failed to broadcast security alert to external webhook:", notifyErr);
    }

    return alert;
  } catch (err) {
    console.error("Failed to record security alert in database:", err);
    return null;
  }
}
