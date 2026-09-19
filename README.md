# 🎯 SignalPulse SaaS — High-Intent Social Buyer Radar

> **Turn Reddit & X Conversations into Paying Customers — On Autopilot.**  
> Built for solo founders, indie hackers, and freelancers who can't afford $100+/mo tools like Brand24 or Mention.

---

## ⚡ The Opportunity & Market Gap

| Traditional Tools (Brand24, Mention) | SignalPulse SaaS |
| :--- | :--- |
| 💸 **\$99 – \$149+ per month** | 💰 **\$9/month** or **\$39 Lifetime Deal (LTD)** |
| 🏢 Built for Fortune 500 PR teams | 🚀 Built for Indie Hackers, Solopreneurs & Freelancers |
| 📉 Bloated charts & vanity metrics | 🎯 Strict focus on **Buyer Intent** ("alternative to X") |
| 🐌 Require complicated Zapier workflows | ⚡ Instant **Telegram Bot & Discord Webhook pings in < 60s** |
| ❌ No reply assistance | 💡 **1-Click AI Sales Pitch Drafter** (non-spammy, tailored) |
| 💳 Expensive official API pricing required | 🆓 **\$0 API Fees** (engineered with public JSON ingestion) |

---

## 🚀 Core Features

- **Zero-Fee Reddit Search Engine**: Monitors Reddit using resilient public JSON search streams with custom User-Agent rotation and subreddit targeting. Zero API key overhead.
- **X (Twitter) Monitoring Adapter**: Ingests buyer discussions with optional Twitter API v2 Bearer token support.
- **High-Intent Classifier**: Real-time heuristic scoring filter that recognizes purchase intent phrases (*"looking for alternative to"*, *"recommend tool for"*, *"tired of"*, *"replace"*) and discards spam or job posts via negative keyword exclusions.
- **Instant Multi-Channel Push**:
  - **Telegram Bot**: Formatted HTML push notifications with inline buttons to jump straight to the post.
  - **Discord Webhooks**: Color-coded rich embed cards matching intent urgency.
- **One-Click AI Pitch Drafter**: Generates 3 contextual, high-converting replies for each lead:
  1. *Helpful & Value-First* (Community friendly, zero spam)
  2. *Founder Story* (Authentic peer maker connection)
  3. *Direct & Concise* (Twitter-friendly)
- **High-Converting Landing Page**: Featuring an interactive live radar simulator, Brand24 comparison table, ROI calculator, and \$9/mo vs \$39 LTD pricing toggle.
- **Monetization Engine**:
  - \$9/month recurring tier
  - \$39 Lifetime Deal (LTD) with built-in promo code redemption engine
- **Authentication**: JWT session auth with bcrypt hashing + Instant 1-Click Demo Login.

---

## 🛠️ Tech Stack

- **Frontend & Fullstack**: Next.js 15 (App Router, Server Actions, React 19, TypeScript)
- **Styling**: Tailwind CSS, Lucide Icons, Glassmorphic modern dark design
- **Database & ORM**: Prisma ORM with SQLite (swappable to PostgreSQL/Supabase with 1 config change)
- **Dispatchers**: Telegram Bot API & Discord Webhook API
- **Deployment**: Docker, Vercel, Render, Railway ready

---

## 🏁 Quickstart Guide

### 1. Prerequisites
- Node.js 18+ (Tested with v20 and v24)
- npm or yarn

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/arifmuneeb051-lab/signalpulse-saas.git
cd signalpulse-saas

# Install dependencies
npm install
```

### 3. Database Setup & Seeding
```bash
# Push database schema
npx prisma db push

# Seed sample high-intent leads, demo keywords, and LTD promo codes
npm run db:seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Pre-Seeded Test Credentials & Promo Codes

### Instant Demo Account
- **Email:** `demo@signalpulse.io`
- **Password:** `password123`
*(Or simply click the **"1-Click Instant Demo Login"** button on the sign-in page!)*

### Test Lifetime Deal (LTD) License Codes
Use these on `/dashboard/billing` to instantly unlock the Lifetime Pro pass:
- `SIGNAL-LTD-PRO-2026`
- `LTD-FOUNDER-39`
- `APPSUMO-PULSE-99`

---

## 📡 Automated Background Monitoring

### Option A: External Cron (Recommended for Vercel / Serverless)
Set up a free cron job on [cron-job.org](https://cron-job.org) or GitHub Actions to ping:
```
POST https://your-domain.com/api/cron/monitor
Authorization: Bearer YOUR_CRON_SECRET
```
Or with query parameter:
```
https://your-domain.com/api/cron/monitor?secret=signalpulse_cron_secret_token_9988
```

### Option B: Standalone Worker (For VPS / Docker)
Run the dedicated background daemon:
```bash
npm run worker
```

---

## 🚢 Production Deployment

### Deploy to Vercel (1-Click)
1. Push this repository to your GitHub account.
2. Import the repo on [Vercel](https://vercel.com).
3. Set the Environment Variables:
   - `JWT_SECRET`: Random secure string (e.g. `openssl rand -hex 32`)
   - `CRON_SECRET`: Random secure string
   - `DATABASE_URL`: Your production database URL (e.g. Postgres on Neon or Supabase)
4. Deploy!

### Deploy via Docker
```bash
docker compose up -d --build
```
Your SaaS will be running at `http://localhost:3000`.

---

## 💰 Monetization Guide (How to sell as a SaaS)

1. **Stripe / LemonSqueezy Integration**:
   - Create two products in LemonSqueezy or Stripe:
     - Product 1: "SignalPulse Pro" (\$9/month)
     - Product 2: "SignalPulse Lifetime Deal" (\$39 one-time)
   - When a customer purchases the \$39 LTD, generate a license key in `LicenseKey` table and email it to the user.
2. **AppSumo / Product Hunt Launch**:
   - Offer the \$39 LTD on AppSumo marketplace or Product Hunt launch day to quickly acquire your first 500 customers (\$19,500 in upfront cashflow).
3. **Indie Hacker Outreach**:
   - Use SignalPulse to dogfood itself: monitor *"alternative to brand24"* on Reddit and reply with your customized pitch!

---

## 📄 License
MIT License. Built with ❤️ for indie founders worldwide.
