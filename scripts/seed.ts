import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding SignalPulse database with Admin, Demo User, and SiteConfig...");

  // 1. Create Dedicated Administrator Account
  const adminEmail = "admin@signalpulse.io";
  const adminHashedPassword = await bcrypt.hash("Admin@2026!", 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: "ADMIN",
      password: adminHashedPassword,
    },
    create: {
      email: adminEmail,
      password: adminHashedPassword,
      name: "Chief Administrator",
      role: "ADMIN",
      productName: "SignalPulse Control",
      productUrl: "https://signalpulse.io",
      productPitch: "Master system administrator account with full company data oversight.",
      plan: "LTD",
      planStatus: "ACTIVE",
    },
  });
  console.log(`🛡️ Admin created: ${admin.email} (Password: Admin@2026!)`);

  // 2. Create Demo Founder User
  const demoEmail = "demo@signalpulse.io";
  const demoHashedPassword = await bcrypt.hash("password123", 10);

  const user = await prisma.user.upsert({
    where: { email: demoEmail },
    update: {
      role: "USER",
    },
    create: {
      email: demoEmail,
      password: demoHashedPassword,
      name: "Muneeb (Founder)",
      role: "USER",
      productName: "SignalPulse",
      productUrl: "https://signalpulse.io",
      productPitch: "A lightweight, $9/mo social listening radar for solo founders to capture Reddit & X buyer leads before competitors.",
      plan: "LTD",
      planStatus: "ACTIVE",
    },
  });
  console.log(`👤 Demo User created: ${user.email}`);

  // 3. Create or update dynamic SiteConfig (CMS configuration)
  await prisma.siteConfig.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      heroHeadline: "Turn Reddit & X Conversations Into Paying Customers on Autopilot.",
      heroSubtitle: "Monitor high-intent phrases like 'looking for alternative to X' or 'recommend tool for Y'. Get instant alerts on Telegram & Discord with ready-to-pitch AI replies in under 60 seconds.",
      announcementText: "Stop paying $100+/month for legacy enterprise monitors — Claim $39 Lifetime Access",
      trialDays: 7,
      monthlyPrice: 9,
      ltdPrice: 39,
      agencyPrice: 79,
    },
  });
  console.log("⚙️ Default SiteConfig initialized.");

  // 4. Create Seed Keywords
  const keywordsData = [
    {
      phrase: "alternative to brand24",
      platform: "ALL",
      negativeKeywords: "free, crack, pirate, hiring",
      targetSubreddits: "startups, Entrepreneur, marketing",
    },
    {
      phrase: "recommend tool for social listening",
      platform: "REDDIT",
      negativeKeywords: "agency, enterprise",
      targetSubreddits: "marketing, growthhacking",
    },
    {
      phrase: "tired of notion",
      platform: "ALL",
      negativeKeywords: "template, aesthetic",
    },
  ];

  for (const kw of keywordsData) {
    const existing = await prisma.keyword.findFirst({
      where: { userId: user.id, phrase: kw.phrase },
    });

    const createdKw =
      existing ||
      (await prisma.keyword.create({
        data: {
          userId: user.id,
          phrase: kw.phrase,
          platform: kw.platform,
          negativeKeywords: kw.negativeKeywords,
          targetSubreddits: kw.targetSubreddits,
          active: true,
        },
      }));

    if (kw.phrase === "alternative to brand24") {
      await prisma.lead.upsert({
        where: {
          userId_externalId: {
            userId: user.id,
            externalId: "rd-sample-101",
          },
        },
        update: {},
        create: {
          userId: user.id,
          keywordId: createdKw.id,
          platform: "REDDIT",
          externalId: "rd-sample-101",
          title: "Anyone know a solid, cheaper alternative to Brand24? $149/mo is insane for an early-stage startup.",
          content: "We just launched our micro-app and want to monitor Reddit/Twitter mentions of our niche keywords. Brand24 and Mention both want over $100/month with annual commitments. Any affordable indie-friendly alternatives that send alerts to Telegram or Discord?",
          author: "dev_marcus",
          url: "https://reddit.com/r/startups/comments/sample101",
          sourceSubreddit: "startups",
          intentScore: "HIGH",
          status: "NEW",
          pitchDraft: "Hey Marcus! Solo founder here. We ran into this exact problem — enterprise tools charging $150/mo for bloated charts. Built SignalPulse (https://signalpulse.io) to do exactly this for $9/mo. It pings your Telegram within 60s of a post going live. Happy to set you up if helpful!",
        },
      });
    }
  }

  // 5. Seed LTD License Keys for Instant Redemption
  const promoKeys = ["SIGNAL-LTD-PRO-2026", "LTD-FOUNDER-39", "APPSUMO-PULSE-99", "INDIE-RADAR-LTD"];
  for (const code of promoKeys) {
    await prisma.licenseKey.upsert({
      where: { code },
      update: {},
      create: {
        code,
        plan: "LTD",
        isUsed: false,
      },
    });
  }

  console.log("✅ Database seeding complete!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
