import { prisma } from "../src/lib/db";

async function main() {
  const updated = await prisma.siteConfig.upsert({
    where: { id: "default" },
    update: {
      ltdPrice: 25,
      announcementText: "Disrupting Traditional Monitors — Claim $25 Lifetime Access Now",
    },
    create: {
      id: "default",
      ltdPrice: 25,
      announcementText: "Disrupting Traditional Monitors — Claim $25 Lifetime Access Now",
    },
  });
  console.log("SUPABASE_UPDATE_SUCCESS:", updated.ltdPrice, updated.announcementText);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
