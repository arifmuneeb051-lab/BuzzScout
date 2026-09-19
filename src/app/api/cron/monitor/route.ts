import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { searchReddit } from "@/lib/scrapers/reddit";
import { searchTwitter } from "@/lib/scrapers/twitter";
import { analyzeIntent } from "@/lib/intent-analyzer";
import { generatePitchTemplates } from "@/lib/ai/pitch-generator";
import { sendTelegramAlert } from "@/lib/notifications/telegram";
import { sendDiscordAlert } from "@/lib/notifications/discord";

export async function GET(req: Request) {
  return handleMonitoringScan(req);
}

export async function POST(req: Request) {
  return handleMonitoringScan(req);
}

async function handleMonitoringScan(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get("secret");
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET || "signalpulse_cron_secret_token_9988";

    let targetUserId: string | null = null;

    // Check if triggered by an authenticated logged-in user
    const loggedInUser = await getCurrentUser();
    if (loggedInUser) {
      targetUserId = loggedInUser.id;
    } else {
      // Validate cron secret if not logged in
      const isBearerValid = authHeader === `Bearer ${cronSecret}`;
      const isSecretValid = secret === cronSecret;

      if (!isBearerValid && !isSecretValid) {
        return NextResponse.json({ error: "Unauthorized cron execution" }, { status: 401 });
      }
    }

    // Find active keywords
    const keywords = await prisma.keyword.findMany({
      where: {
        active: true,
        ...(targetUserId ? { userId: targetUserId } : {}),
      },
      include: {
        user: {
          include: {
            channels: {
              where: { active: true },
            },
          },
        },
      },
    });

    let totalDiscovered = 0;
    let alertsSent = 0;

    for (const kw of keywords) {
      const phrase = kw.phrase;
      const platform = kw.platform;
      const user = kw.user;

      const candidates: Array<{
        platform: "REDDIT" | "TWITTER";
        externalId: string;
        title: string;
        content: string;
        author: string;
        url: string;
        subreddit?: string;
      }> = [];

      // 1. Ingest from Reddit
      if (platform === "ALL" || platform === "REDDIT") {
        const redditPosts = await searchReddit(phrase, kw.targetSubreddits);
        for (const post of redditPosts) {
          candidates.push({
            platform: "REDDIT",
            externalId: `rd-${post.id}`,
            title: post.title,
            content: post.selftext || post.title,
            author: post.author,
            url: post.url,
            subreddit: post.subreddit,
          });
        }
      }

      // 2. Ingest from Twitter / X
      if (platform === "ALL" || platform === "TWITTER") {
        const tweets = await searchTwitter(phrase);
        for (const tweet of tweets) {
          candidates.push({
            platform: "TWITTER",
            externalId: `tw-${tweet.id}`,
            title: tweet.text.slice(0, 100),
            content: tweet.text,
            author: tweet.author,
            url: tweet.url,
          });
        }
      }

      // 3. Filter candidates through Intent Analyzer & save new leads
      for (const item of candidates) {
        const fullText = `${item.title} ${item.content}`;
        const analysis = analyzeIntent(fullText, phrase, kw.negativeKeywords);

        // Skip negative matches
        if (analysis.isNegativeMatch) continue;

        // Check if already stored for this user
        const exists = await prisma.lead.findUnique({
          where: {
            userId_externalId: {
              userId: user.id,
              externalId: item.externalId,
            },
          },
        });

        if (exists) continue;

        // Generate AI pitch draft for this lead
        const pitches = generatePitchTemplates({
          postTitle: item.title,
          postContent: item.content,
          postAuthor: item.author,
          productName: user.productName || "our tool",
          productUrl: user.productUrl || "https://example.com",
          productPitch: user.productPitch || undefined,
          platform: item.platform,
        });

        const initialPitch = pitches[0]?.text || null;

        // Save lead
        const lead = await prisma.lead.create({
          data: {
            userId: user.id,
            keywordId: kw.id,
            platform: item.platform,
            externalId: item.externalId,
            title: item.title,
            content: item.content,
            author: item.author,
            url: item.url,
            sourceSubreddit: item.subreddit || null,
            intentScore: analysis.score,
            status: "NEW",
            pitchDraft: initialPitch,
          },
        });

        totalDiscovered++;

        // Update keyword leads count
        await prisma.keyword.update({
          where: { id: kw.id },
          data: {
            leadsCount: { increment: 1 },
            lastCheckedAt: new Date(),
          },
        });

        // 4. Dispatch instant alerts to configured channels
        for (const ch of user.channels) {
          if (ch.type === "TELEGRAM" && ch.telegramBotToken && ch.telegramChatId) {
            sendTelegramAlert({
              botToken: ch.telegramBotToken,
              chatId: ch.telegramChatId,
              lead: {
                platform: lead.platform,
                title: lead.title,
                content: lead.content,
                author: lead.author,
                url: lead.url,
                intentScore: lead.intentScore,
                keyword: kw.phrase,
                subreddit: lead.sourceSubreddit,
                pitchDraft: lead.pitchDraft,
              },
            }).catch((err) => console.error("Telegram dispatch error:", err));
            alertsSent++;
          }

          if (ch.type === "DISCORD" && ch.discordWebhookUrl) {
            sendDiscordAlert({
              webhookUrl: ch.discordWebhookUrl,
              lead: {
                platform: lead.platform,
                title: lead.title,
                content: lead.content,
                author: lead.author,
                url: lead.url,
                intentScore: lead.intentScore,
                keyword: kw.phrase,
                subreddit: lead.sourceSubreddit,
                pitchDraft: lead.pitchDraft,
              },
            }).catch((err) => console.error("Discord dispatch error:", err));
            alertsSent++;
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      keywordsScanned: keywords.length,
      newLeadsDiscovered: totalDiscovered,
      alertsDispatched: alertsSent,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("Monitoring scan error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
