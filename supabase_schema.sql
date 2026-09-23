-- ==============================================================================
-- BUZZSCOUT PRODUCTION DATABASE SCHEMA FOR SUPABASE (POSTGRESQL)
-- ==============================================================================
-- Run this complete script in your Supabase SQL Editor:
-- Supabase Dashboard -> Select Project -> SQL Editor -> New query -> Paste & Click Run
-- ==============================================================================

-- 1. Enable pgcrypto extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- Table 1: "User" (Founders, Customers, and Administrators)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "email" TEXT UNIQUE NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "productName" TEXT DEFAULT 'My Product',
    "productUrl" TEXT DEFAULT 'https://myproduct.io',
    "productPitch" TEXT DEFAULT 'An affordable and fast modern solution for founders.',
    "plan" TEXT NOT NULL DEFAULT 'INACTIVE',
    "planStatus" TEXT NOT NULL DEFAULT 'PENDING_PAYMENT',
    "trialEndsAt" TIMESTAMP WITH TIME ZONE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Table 2: "Keyword" (Social Listening Radar Keywords)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "Keyword" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "phrase" TEXT NOT NULL,
    "platform" TEXT NOT NULL DEFAULT 'ALL',
    "negativeKeywords" TEXT,
    "targetSubreddits" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "leadsCount" INTEGER NOT NULL DEFAULT 0,
    "lastCheckedAt" TIMESTAMP WITH TIME ZONE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Table 3: "Lead" (Discovered High-Intent Sales Conversations)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "Lead" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "keywordId" TEXT NOT NULL REFERENCES "Keyword"("id") ON DELETE CASCADE,
    "platform" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "authorUrl" TEXT,
    "url" TEXT NOT NULL,
    "sourceSubreddit" TEXT,
    "intentScore" TEXT NOT NULL DEFAULT 'HIGH',
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "pitchDraft" TEXT,
    "detectedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT "Lead_userId_externalId_key" UNIQUE ("userId", "externalId")
);

-- ------------------------------------------------------------------------------
-- Table 4: "AlertChannel" (Discord Webhooks & Telegram Bot Credentials)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "AlertChannel" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "type" TEXT NOT NULL,
    "telegramBotToken" TEXT,
    "telegramChatId" TEXT,
    "discordWebhookUrl" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Table 5: "LicenseKey" (Lifetime Founder Pass Cryptographic Codes)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "LicenseKey" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "code" TEXT UNIQUE NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'LTD',
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "usedByEmail" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "redeemedAt" TIMESTAMP WITH TIME ZONE
);

-- ------------------------------------------------------------------------------
-- Table 6: "SiteConfig" (Singleton Admin CMS & Live Dynamic Pricing Settings)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "SiteConfig" (
    "id" TEXT PRIMARY KEY DEFAULT 'default',
    "heroHeadline" TEXT NOT NULL DEFAULT 'Turn Reddit & X Discussions Into Paying Customers on Autopilot.',
    "heroSubtitle" TEXT NOT NULL DEFAULT 'Monitor high-intent phrases like ''looking for alternative to X'' or ''recommend tool for Y''. Get instant mobile alerts on Telegram & Discord with ready-to-pitch AI replies in under 60 seconds.',
    "announcementText" TEXT NOT NULL DEFAULT 'Stop paying $100+/month for legacy enterprise monitors — Get Started for $5/mo or $35 Lifetime Pass',
    "trialDays" INTEGER NOT NULL DEFAULT 0,
    "monthlyPrice" INTEGER NOT NULL DEFAULT 5,
    "ltdPrice" INTEGER NOT NULL DEFAULT 35,
    "agencyPrice" INTEGER NOT NULL DEFAULT 79,
    "stripeSecretKey" TEXT,
    "stripePublishableKey" TEXT,
    "stripePaymentLink" TEXT,
    "stripeMonthlyLink" TEXT,
    "stripeLtdLink" TEXT,
    "stripeAgencyLink" TEXT,
    "stripeWebhookSecret" TEXT,
    "paymentMode" TEXT NOT NULL DEFAULT 'TEST',
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Table 7: "PaymentTransaction" (Financial Audit Trail & Receipts)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "PaymentTransaction" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT,
    "userEmail" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "plan" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "paymentMethod" TEXT NOT NULL DEFAULT 'CARD',
    "stripeSessionId" TEXT,
    "cardLast4" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Performance Indexes for 100+ Concurrent Users & Sub-Second Query Execution
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS "idx_user_email" ON "User"("email");
CREATE INDEX IF NOT EXISTS "idx_keyword_userId" ON "Keyword"("userId");
CREATE INDEX IF NOT EXISTS "idx_lead_userId" ON "Lead"("userId");
CREATE INDEX IF NOT EXISTS "idx_lead_keywordId" ON "Lead"("keywordId");
CREATE INDEX IF NOT EXISTS "idx_lead_detectedAt" ON "Lead"("detectedAt" DESC);
CREATE INDEX IF NOT EXISTS "idx_alertchannel_userId" ON "AlertChannel"("userId");
CREATE INDEX IF NOT EXISTS "idx_licensekey_code" ON "LicenseKey"("code");
CREATE INDEX IF NOT EXISTS "idx_paymenttransaction_userEmail" ON "PaymentTransaction"("userEmail");

-- ------------------------------------------------------------------------------
-- Initial Seed: Default Site Configuration
-- ------------------------------------------------------------------------------
INSERT INTO "SiteConfig" (
    "id",
    "heroHeadline",
    "heroSubtitle",
    "announcementText",
    "trialDays",
    "monthlyPrice",
    "ltdPrice",
    "agencyPrice",
    "paymentMode",
    "updatedAt"
)
VALUES (
    'default',
    'Turn Reddit & X Discussions Into Paying Customers on Autopilot.',
    'Monitor high-intent phrases like ''looking for alternative to X'' or ''recommend tool for Y''. Get instant mobile alerts on Telegram & Discord with ready-to-pitch AI replies in under 60 seconds.',
    'Stop paying $100+/month for legacy enterprise monitors — Get Started for $5/mo or $35 Lifetime Pass',
    0,
    5,
    35,
    79,
    'TEST',
    NOW()
)
ON CONFLICT ("id") DO UPDATE SET
    "monthlyPrice" = EXCLUDED."monthlyPrice",
    "ltdPrice" = EXCLUDED."ltdPrice",
    "trialDays" = EXCLUDED."trialDays",
    "updatedAt" = NOW();

-- ------------------------------------------------------------------------------
-- Row Level Security (RLS) Defense-in-Depth Shielding
-- ------------------------------------------------------------------------------
-- Prisma connects directly using the PostgreSQL pooler role (bypassing RLS),
-- but enabling RLS on all tables ensures that any direct Supabase PostgREST/anon key
-- access is blocked from reading or tampering with application tables.
ALTER TABLE IF EXISTS "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "Keyword" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "Lead" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "AlertChannel" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "LicenseKey" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "SiteConfig" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "PaymentTransaction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "SecurityAlert" ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "BlockedIp" ENABLE ROW LEVEL SECURITY;

-- Allow read-only access to SiteConfig for public CMS headlines & pricing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'SiteConfig' AND policyname = 'Public Read Safe SiteConfig'
    ) THEN
        CREATE POLICY "Public Read Safe SiteConfig" ON "SiteConfig" FOR SELECT USING (true);
    END IF;
END
$$;
