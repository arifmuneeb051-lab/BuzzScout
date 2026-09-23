import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding BuzzScout database with Master Administrator and SiteConfig...");

  // 1. Create Dedicated Administrator Account
  const adminEmail = process.env.ADMIN_EMAIL || process.env.ADMIN_ID;
  const adminPass = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPass) {
    console.error("❌ ADMIN_EMAIL and ADMIN_PASSWORD must be configured in environment variables to seed database.");
    process.exit(1);
  }

  const adminHashedPassword = await bcrypt.hash(adminPass, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: "ADMIN",
      password: adminHashedPassword,
    },
    create: {
      email: adminEmail,
      password: adminHashedPassword,
      name: process.env.ADMIN_NAME || "Master Administrator",
      role: "ADMIN",
      productName: "BuzzScout Control",
      productUrl: "https://buzzscout.io",
      productPitch: "Master system administrator account with full company data oversight.",
      plan: "LTD",
      planStatus: "ACTIVE",
    },
  });
  console.log(`🛡️ Admin verified: ${admin.email}`);

  // 2. Create or update dynamic SiteConfig (CMS configuration)
  await prisma.siteConfig.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      heroHeadline: "Turn Reddit & X Conversations Into Paying Customers on Autopilot.",
      heroSubtitle: "Monitor high-intent phrases like 'looking for alternative to X' or 'recommend tool for Y'. Get instant alerts on Telegram & Discord with ready-to-pitch AI replies in under 60 seconds.",
      announcementText: "Stop paying $100+/month for legacy enterprise monitors — Claim Lifetime Founder Pass",
      trialDays: 7,
      monthlyPrice: 5,
      ltdPrice: 35,
      agencyPrice: 79,
    },
  });
  console.log("⚙️ Default SiteConfig initialized.");

  // 3. Seed LTD License Keys for Instant Redemption
  const promoKeys = ["BUZZ-LTD-PRO-2026", "FOUNDER-PASS-35", "APPSUMO-BUZZ-99", "INDIE-RADAR-LTD"];
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
  console.log("🎟️ Seed promo keys initialized.");
  console.log("✅ Database seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
