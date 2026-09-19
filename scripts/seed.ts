import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding SignalPulse database...");

  // 1. Create Demo Founder User
  const demoEmail = "demo@signalpulse.io";
  const hashedPassword = await bcrypt.hash("password123", 10);

  const user = await prisma.user.upsert({
    where: { email: demoEmail },
    update: {},
    create: {
      email: demoEmail,
      password: hashedPassword,
      name: "Muneeb (Founder)",
      productName: "SignalPulse",
      productUrl: "https://signalpulse.io",
      productPitch: "A lightweight, $9/mo social listening radar for solo founders to capture Reddit & X buyer leads before competitors.",
      plan: "LTD",
      planStatus: "ACTIVE",
    },
  });

  console.log(`👤 Created user: ${user.email}`);

  // 2. Create Seed Keywords
  const keywordsData = [
    {
      phrase: "alternative to brand24",
      platform: "ALL",
      negativeKeywords: "free, crack, pirate, hiring",
      targetSubreddits: "SaaS, startups, Entrepreneur",
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
    const createdKw = await prisma.keyword.create({
      data: {
        userId: user.id,
        phrase: kw.phrase,
        platform: kw.platform,
        negativeKeywords: kw.negativeKeywords,
        targetSubreddits: kw.targetSubreddits,
        active: true,
      },
    });

    // 3. Create Sample High-Intent Leads for each keyword
    if (kw.phrase === "alternative to brand24") {
      await prisma.lead.createMany({
        data: [
          {
            userId: user.id,
            keywordId: createdKw.id,
            platform: "REDDIT",
            externalId: "rd-sample-101",
            title: "Anyone know a solid, cheaper alternative to Brand24? $149/mo is insane for an early-stage startup.",
            content: "We just launched our micro-SaaS and want to monitor Reddit/Twitter mentions of our niche keywords. Brand24 and Mention both want over $100/month with annual commitments. Any affordable indie-friendly alternatives that send alerts to Telegram or Discord?",
            author: "dev_marcus",
            url: "https://reddit.com/r/SaaS/comments/sample101",
            sourceSubreddit: "SaaS",
            intentScore: "HIGH",
            status: "NEW",
            pitchDraft: "Hey Marcus! Solo founder here. We ran into this exact problem — enterprise tools charging $150/mo for bloated charts. Built SignalPulse (https://signalpulse.io) to do exactly this for $9/mo. It pings your Telegram within 60s of a post going live. Happy to set you up if helpful!",
          },
          {
            userId: user.id,
            keywordId: createdKw.id,
            platform: "TWITTER",
            externalId: "tw-sample-102",
            title: "Looking for a budget-friendly Twitter & Reddit social listener.",
            content: "Looking for an alternative to Brand24 that doesn't cost an arm and a leg. Just need 3 keyword alerts sent to my Discord. Recommendations?",
            author: "sarah_indie",
            url: "https://x.com/sarah_indie/status/sample102",
            intentScore: "HIGH",
            status: "PITCHED",
            pitchDraft: "@sarah_indie Hey Sarah! Check out SignalPulse (https://signalpulse.io) — built for solo makers with instant Discord webhook alerts and zero enterprise bloat. Flat $9/mo or $39 Lifetime Deal.",
          },
        ],
      });
    } else if (kw.phrase === "recommend tool for social listening") {
      await prisma.lead.createMany({
        data: [
          {
            userId: user.id,
            keywordId: createdKw.id,
            platform: "REDDIT",
            externalId: "rd-sample-201",
            title: "What is the best tool for social listening on Reddit in 2026?",
            content: "I want to track discussions in r/startups and r/entrepreneur when someone asks for software recommendations in our industry. What do people use nowadays?",
            author: "growth_sam",
            url: "https://reddit.com/r/startups/comments/sample201",
            sourceSubreddit: "startups",
            intentScore: "HIGH",
            status: "NEW",
            pitchDraft: "Hey Sam! For Reddit specifically, most tools are either too expensive or too slow. Check out SignalPulse (https://signalpulse.io) — it scans new discussions and scores high-buyer intent so you only get pinged when someone is actually looking to buy.",
          },
        ],
      });
    }
  }

  // 4. Seed LTD License Keys for Instant Redemption
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

  console.log(`🎟️ Seeded ${promoKeys.length} LTD promotional license keys.`);
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
