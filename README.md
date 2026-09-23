# 🎯 BuzzScout — High-Intent Social Buyer Radar

> **Turn Reddit & X Conversations into Paying Customers — On Autopilot.**  
> Built for solo founders, indie hackers, and freelancers who can't afford $100+/mo tools like Brand24 or Mention.

> [!CAUTION]
> **CRITICAL PRE-DEPLOYMENT NOTICE — SECRET ROTATION MANDATORY**:  
> If any secrets (such as Supabase database credentials, JWT secret, Admin password, or API keys) were previously configured in local development files or past commits, those values remain archived in Git history.  
> **You MUST rotate/change your Supabase database password, JWT secret, and Master Admin credentials in your provider dashboards before deploying to production!**  
> Never commit `.env` or `.env.local` to public or private git repositories. Use `.env.example` as a template.

---

## ⚡ The Opportunity & Market Gap

| Traditional Tools (Brand24, Mention) | BuzzScout SaaS |
| :--- | :--- |
| 💸 **\$99 – \$149+ per month** | 💰 **\$5/month** or **\$35 Lifetime Deal (LTD)** |
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
- **One-Click AI Pitch Drafter**: Generates contextual, high-converting replies tailored to your product pitch.
- **Monetization Engine**:
  - \$5/month recurring Pro tier
  - \$35 Lifetime Deal (LTD) with built-in promo code redemption engine
  - \$79/month Agency tier
- **Authentication**: Secure JWT session auth with bcrypt hashing (10 salt rounds).

---

## 🛠️ Tech Stack

- **Frontend & Fullstack**: Next.js 15 (App Router, Server Actions, React 19, TypeScript)
- **Styling**: Tailwind CSS, Lucide Icons, Modern dark glassmorphic UI
- **Database & ORM**: Prisma ORM with Supabase PostgreSQL
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
git clone https://github.com/arifmuneeb051-lab/buzzscout.git
cd buzzscout

# Install dependencies
npm install
```

### 3. Database Setup
```bash
# Push database schema
npx prisma db push
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📡 Automated Background Monitoring

### Option A: External Cron (Recommended for Vercel / Serverless)
Set up a cron job on [cron-job.org](https://cron-job.org) or GitHub Actions to ping:
```
POST https://your-domain.com/api/cron/monitor
Authorization: Bearer YOUR_CRON_SECRET
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
3. Set Environment Variables (`DATABASE_URL`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`).
4. Deploy!

### Deploy via Docker
```bash
docker compose up -d --build
```
Your SaaS will be running at `http://localhost:3000`.

---

## 📄 License
MIT License. Built with ❤️ for indie founders worldwide.
