"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Radar,
  Zap,
  Bell,
  Sparkles,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ShieldCheck,
  Send,
  Search,
  Filter,
  Check,
  ChevronDown,
  Sun,
  Moon,
  Copy,
  Clock,
  ExternalLink,
  Coins,
  TrendingUp,
  Flame,
  MessageSquare,
  Layers,
  Target,
} from "lucide-react";

interface SiteConfigData {
  heroHeadline: string;
  heroSubtitle: string;
  announcementText: string;
  trialDays: number;
  monthlyPrice: number;
  ltdPrice: number;
  agencyPrice: number;
}

interface DemoScenario {
  id: string;
  label: string;
  tag: string;
  platform: "reddit" | "twitter";
  subredditOrHandle: string;
  timeAgo: string;
  user: string;
  title: string;
  body: string;
  intentPercent: number;
  helpfulPitch: string;
  founderPitch: string;
  directPitch: string;
}

const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: "devtools",
    label: "🛠️ Micro-Tools",
    tag: "r/startups • Reddit",
    platform: "reddit",
    subredditOrHandle: "r/startups",
    timeAgo: "18s ago",
    user: "u/SoloMaker_Dan",
    title: "Any affordable alternative to Brand24 or Mention? $149/mo is way too steep for our launch stage.",
    body: "We just need to track 3 keywords on Reddit & X and get notified on Telegram whenever someone asks for a tool recommendation. Any suggestions?",
    intentPercent: 99,
    helpfulPitch: "Hey Dan! If you just need keyword alerts without enterprise clutter, look for tools with direct Telegram/Discord webhooks. A lightweight social monitor usually does the job for under $10/mo with zero API fees.",
    founderPitch: "Hey Dan, solo builder here! I got frustrated paying $149/mo just to track 3 Reddit keywords, so I built SignalPulse. Scans 24/7 and pings your Telegram for $9/mo. Happy to give you extended access if helpful!",
    directPitch: "SignalPulse monitors Reddit & X keywords in real-time with zero API fees for $9/mo. Direct Telegram & Discord pings in under 60 seconds with 1-click AI replies.",
  },
  {
    id: "ai",
    label: "🤖 AI & Automation",
    tag: "X / Twitter",
    platform: "twitter",
    subredditOrHandle: "@alex_builds",
    timeAgo: "42s ago",
    user: "@alex_builds",
    title: "Looking for a fast document parsing tool that extracts structured tables cleanly.",
    body: "Need something reliable with an easy REST endpoint and flat pricing. Tired of per-page enterprise billing models that kill margins.",
    intentPercent: 97,
    helpfulPitch: "Look into models supporting direct table OCR bounding boxes. Modern lightweight parsers handle nested rows gracefully without enterprise lock-in.",
    founderPitch: "Built an indie solution for this exact table extraction bottleneck after getting burned by per-page invoices. Check out SignalPulse's founder suite for fast integrations!",
    directPitch: "Automated parsing engine built for high-throughput table extraction. Flat founder pricing and instant webhook responses.",
  },
  {
    id: "marketing",
    label: "📈 Marketing & Growth",
    tag: "r/Entrepreneur • Reddit",
    platform: "reddit",
    subredditOrHandle: "r/Entrepreneur",
    timeAgo: "1m ago",
    user: "u/GrowthHacker_Leo",
    title: "What is the best way to find people actively complaining about competitors on social media?",
    body: "Cold outreach has single-digit response rates. Where can I find warm conversations of users asking 'why does tool X suck, what do you use instead?'",
    intentPercent: 96,
    helpfulPitch: "The highest conversion channel is social listening for intent triggers like 'alternative to X' or 'why is X so buggy'. Responding with helpful advice in the first 15 minutes converts 5x better than cold DMs.",
    founderPitch: "That exact insight drove me to build SignalPulse! We filter for pain-point keywords and ping your phone the moment a thread opens so you can reply authentically.",
    directPitch: "SignalPulse detects competitor complaint keywords on Reddit & X 24/7. Instant mobile alerts let you join the conversation first.",
  },
  {
    id: "design",
    label: "🎨 Design & Web Apps",
    tag: "r/webdev • Reddit",
    platform: "reddit",
    subredditOrHandle: "r/webdev",
    timeAgo: "2m ago",
    user: "u/DevStudio_Kim",
    title: "Need modern UI components with frosted glass and dual dark/light themes.",
    body: "Our clients want luxury bento grids, glassmorphism, and crystal-clear contrast in both dark and light modes. What library or design kit should we use?",
    intentPercent: 94,
    helpfulPitch: "Combine Tailwind with backdrop-blur-2xl and layered inset borders. For light mode, make sure to use deep slate typography (text-slate-900) so frosted glass stays razor sharp.",
    founderPitch: "We spent weeks perfecting this exact dual-theme glassmorphic architecture for SignalPulse using 21st.dev standards. Feel free to inspect our layout for inspiration!",
    directPitch: "21st.dev inspired luxury glassmorphic design system with full dark and light mode support and zero text contrast flaws.",
  },
];

export default function LandingPage() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "ltd">("ltd");
  
  // Interactive Live Studio State
  const [selectedScenario, setSelectedScenario] = useState<DemoScenario>(DEMO_SCENARIOS[0]);
  const [pitchStyle, setPitchStyle] = useState<"helpful" | "founder" | "direct">("founder");
  const [copied, setCopied] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Dynamic Site Config from Admin Portal
  const [siteConfig, setSiteConfig] = useState<SiteConfigData>({
    heroHeadline: "Turn Reddit & X Discussions Into Paying Customers on Autopilot.",
    heroSubtitle: "Monitor high-intent phrases like 'looking for alternative to X' or 'recommend tool for Y'. Get instant mobile alerts on Telegram & Discord with ready-to-pitch AI replies in under 60 seconds.",
    announcementText: "Stop paying $100+/month for legacy enterprise monitors — Claim $39 Lifetime Access",
    trialDays: 7,
    monthlyPrice: 9,
    ltdPrice: 39,
    agencyPrice: 79,
  });

  // Dynamic Profit Calculator state
  const [productPrice, setProductPrice] = useState(39);
  const [monthlyLeadsEstimate, setMonthlyLeadsEstimate] = useState(8);

  useEffect(() => {
    fetch("/api/site-config")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.heroHeadline) {
          setSiteConfig({
            heroHeadline: data.heroHeadline,
            heroSubtitle: data.heroSubtitle,
            announcementText: data.announcementText,
            trialDays: data.trialDays || 7,
            monthlyPrice: data.monthlyPrice || 9,
            ltdPrice: data.ltdPrice || 39,
            agencyPrice: data.agencyPrice || 79,
          });
        }
      })
      .catch(() => {});
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleSimulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 1200);
  };

  const getCurrentPitchText = () => {
    if (pitchStyle === "helpful") return selectedScenario.helpfulPitch;
    if (pitchStyle === "founder") return selectedScenario.founderPitch;
    return selectedScenario.directPitch;
  };

  const handleCopyPitch = () => {
    navigator.clipboard.writeText(getCurrentPitchText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const faqs = [
    {
      q: `How does the ${siteConfig.trialDays}-Day Free Trial work?`,
      a: `You get full, unrestricted access to all features (Reddit & X scanning, instant Telegram/Discord alerts, and AI pitch drafting) for ${siteConfig.trialDays} days with zero credit card required. After ${siteConfig.trialDays} days, you can choose to continue with our $${siteConfig.monthlyPrice}/month plan or grab the $${siteConfig.ltdPrice} Lifetime Deal.`,
    },
    {
      q: "Do I need to pay for expensive Reddit or Twitter API access?",
      a: "No! SignalPulse is engineered with zero-overhead public search ingestion for Reddit, requiring $0 official API fees. For Twitter/X, it uses intelligent open search syndication or lets you optionally add your own bearer token.",
    },
    {
      q: "How fast do notifications arrive on Telegram and Discord?",
      a: "SignalPulse scans active discussions round-the-clock. As soon as a matching high-intent buyer query goes live, your Telegram bot or Discord channel pings your phone in under 60 seconds.",
    },
    {
      q: "Will Reddit or X flag my account for replying?",
      a: "No, because SignalPulse never uses automated spam bots to post replies. Instead, it alerts you privately and drafts a high-value, authentic reply that you can review, copy, and post organically from your own personal account.",
    },
    {
      q: `How does the $${siteConfig.ltdPrice} Lifetime Deal (LTD) work?`,
      a: `You make a single one-time payment of $${siteConfig.ltdPrice} and receive a permanent Lifetime License code. You get unlimited access to all features with zero recurring monthly subscription fees forever.`,
    },
  ];

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        theme === "dark"
          ? "dark bg-[#070a12] text-slate-100 dark-grid-pattern"
          : "light bg-[#f8fafc] text-slate-900 light-grid-pattern"
      } selection:bg-indigo-500/30 selection:text-indigo-600 relative overflow-x-hidden`}
    >
      {/* Dynamic Ambient Glow & Beams */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {theme === "dark" ? (
          <>
            <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-radial-glow blur-[100px] opacity-70" />
            <div className="absolute top-1/3 -left-48 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[140px]" />
            <div className="absolute top-2/3 -right-48 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px]" />
          </>
        ) : (
          <>
            <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-indigo-300/20 via-purple-300/15 to-transparent rounded-full blur-[120px]" />
            <div className="absolute top-1/3 -left-48 w-[500px] h-[500px] bg-sky-200/40 rounded-full blur-[140px]" />
            <div className="absolute top-2/3 -right-48 w-[500px] h-[500px] bg-indigo-200/30 rounded-full blur-[140px]" />
          </>
        )}
      </div>

      {/* Floating Glassmorphic Header */}
      <header
        className={`sticky top-0 z-50 backdrop-blur-2xl border-b transition-all duration-300 ${
          theme === "dark"
            ? "bg-[#070a12]/85 border-white/[0.08] shadow-2xl shadow-black/40"
            : "bg-white/85 border-slate-200/90 shadow-sm shadow-slate-900/5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 flex items-center justify-center shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform duration-300 border border-indigo-400/30">
              <Radar className="w-5 h-5 text-white animate-pulse" />
            </div>
            <span
              className={`text-xl font-extrabold tracking-tight ${
                theme === "dark" ? "text-white" : "text-slate-950"
              }`}
            >
              SignalPulse
            </span>
          </Link>

          {/* Navigation Links */}
          <nav
            className={`hidden md:flex items-center space-x-8 text-sm font-semibold ${
              theme === "dark" ? "text-slate-300" : "text-slate-700"
            }`}
          >
            <a href="#interactive-radar" className="hover:text-indigo-600 transition-colors">Live Radar</a>
            <a href="#how-it-works" className="hover:text-indigo-600 transition-colors">Workflow</a>
            <a href="#bento" className="hover:text-indigo-600 transition-colors">Architecture</a>
            <a href="#roi" className="hover:text-indigo-600 transition-colors">ROI Calculator</a>
            <a href="#comparison" className="hover:text-indigo-600 transition-colors">Comparison</a>
            <a href="#pricing" className="hover:text-indigo-600 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-indigo-600 transition-colors">FAQ</a>
          </nav>

          {/* Actions: Theme Toggle + Auth */}
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className={`p-2.5 rounded-xl border transition-all duration-200 flex items-center gap-1.5 text-xs font-bold ${
                theme === "dark"
                  ? "bg-slate-900/90 border-slate-700 text-amber-400 hover:bg-slate-800 hover:border-amber-400/40 shadow-inner"
                  : "bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200 shadow-sm"
              }`}
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline text-slate-200">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-600" />
                  <span className="hidden sm:inline text-slate-800">Dark</span>
                </>
              )}
            </button>

            <Link
              href="/login"
              className={`text-sm font-bold px-3 py-1.5 transition-colors ${
                theme === "dark"
                  ? "text-slate-300 hover:text-white"
                  : "text-slate-700 hover:text-slate-950"
              }`}
            >
              Sign In
            </Link>

            <Link
              href="/dashboard"
              className="relative inline-flex items-center justify-center p-[1px] overflow-hidden rounded-xl font-bold transition-all group"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl group-hover:opacity-100 transition-opacity" />
              <span
                className={`relative px-4 py-2 text-xs sm:text-sm font-bold rounded-[11px] transition-all duration-200 flex items-center gap-1.5 ${
                  theme === "dark"
                    ? "text-white bg-[#0a0f1d] group-hover:bg-opacity-80"
                    : "text-white bg-indigo-600 group-hover:bg-indigo-700"
                }`}
              >
                <span>Launch Radar</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section (Dynamically powered by SiteConfig CMS) */}
      <section className="relative z-10 pt-16 pb-20 md:pt-24 md:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Dynamic Shimmer Announcement Bar */}
        <div
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs sm:text-sm font-semibold mb-8 shadow-xl transition-transform hover:scale-[1.01] ${
            theme === "dark"
              ? "shimmer-badge-dark border-indigo-500/40 text-indigo-200"
              : "shimmer-badge-light border-indigo-300/80 text-indigo-900 shadow-indigo-100/50"
          }`}
        >
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span>{siteConfig.announcementText}</span>
          <a
            href="#pricing"
            className={`font-bold underline underline-offset-2 ml-1 cursor-pointer ${
              theme === "dark" ? "text-white hover:text-indigo-300" : "text-indigo-950 hover:text-indigo-700"
            }`}
          >
            Claim ${siteConfig.ltdPrice} Lifetime Deal &rarr;
          </a>
        </div>

        {/* Dynamic Hero Title with Luxury Gradient */}
        <h1
          className={`text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-5xl mx-auto leading-[1.14] ${
            theme === "dark"
              ? "text-white"
              : "text-slate-950"
          }`}
        >
          {siteConfig.heroHeadline}
        </h1>

        {/* Dynamic Hero Subtitle */}
        <p
          className={`mt-6 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed font-medium ${
            theme === "dark" ? "text-slate-300" : "text-slate-700"
          }`}
        >
          {siteConfig.heroSubtitle}
        </p>

        {/* Hero CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-base shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all duration-200 flex items-center justify-center gap-2 group"
          >
            <span>Start {siteConfig.trialDays}-Day Free Trial</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/login"
            className={`w-full sm:w-auto px-8 py-4 rounded-xl border font-bold text-base transition-all flex items-center justify-center gap-2 ${
              theme === "dark"
                ? "bg-slate-900/90 hover:bg-slate-800 text-slate-100 border-slate-700/80"
                : "bg-white hover:bg-slate-50 text-slate-900 border-slate-300 shadow-md"
            }`}
          >
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Try 1-Click Demo</span>
          </Link>
        </div>

        {/* Social Proof Badges */}
        <div
          className={`mt-10 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm font-semibold ${
            theme === "dark" ? "text-slate-300" : "text-slate-700"
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>{siteConfig.trialDays}-Day Full Access ($0, No Card)</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Zero $0 API Overhead</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Sub-60s Telegram & Discord Push</span>
          </div>
        </div>

        {/* =========================================================
            CREATIVE INTERACTIVE RADAR & AI PITCH STUDIO
            ========================================================= */}
        <div id="interactive-radar" className="mt-16 max-w-5xl mx-auto text-left">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                  Interactive Live Lead Simulator
                </span>
              </div>
              <h3
                className={`text-lg sm:text-xl font-extrabold mt-1 ${
                  theme === "dark" ? "text-white" : "text-slate-950"
                }`}
              >
                Experience Live Lead Detection & Instant AI Replies
              </h3>
            </div>

            {/* Scenario Category Tabs */}
            <div
              className={`flex items-center p-1 rounded-2xl border text-xs font-bold ${
                theme === "dark"
                  ? "bg-slate-900/90 border-slate-800"
                  : "bg-white border-slate-300 shadow-sm"
              }`}
            >
              {DEMO_SCENARIOS.map((sc) => (
                <button
                  key={sc.id}
                  onClick={() => setSelectedScenario(sc)}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    selectedScenario.id === sc.id
                      ? "bg-indigo-600 text-white shadow-md"
                      : theme === "dark"
                      ? "text-slate-400 hover:text-slate-200"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {sc.label}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Studio Glass Container */}
          <div
            className={`rounded-3xl border p-6 sm:p-8 flash-card-glow shadow-2xl transition-all ${
              theme === "dark"
                ? "bg-[#0c1220]/90 border-indigo-500/30 shadow-indigo-950/40"
                : "bg-white/95 border-slate-300 shadow-xl shadow-indigo-100/50"
            }`}
          >
            {/* Top Bar: Live Scanner Indicator & Keyword Search */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="relative flex items-center justify-center h-9 w-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  <Radar className={`w-5 h-5 ${isScanning ? "animate-spin text-amber-500" : "animate-pulse"}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      Status:
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                      {isScanning ? "Filtering Live Streams..." : "24/7 Scanning Active"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 font-mono">
                    Ingesting public Reddit JSON & X search feeds
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSimulateScan}
                  disabled={isScanning}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isScanning ? "Scanning..." : "Trigger Live Scan"}</span>
                </button>
              </div>
            </div>

            {/* Split View: Live Buyer Post (Left) vs AI Reply Generator (Right) */}
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: The Detected Buyer Discussion */}
              <div
                className={`rounded-2xl p-5 border space-y-4 flex flex-col justify-between ${
                  theme === "dark"
                    ? "bg-slate-900/80 border-slate-800"
                    : "bg-slate-50/90 border-slate-200/90 shadow-sm"
                }`}
              >
                <div className="space-y-3">
                  {/* Platform & Intent Badges */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold ${
                        selectedScenario.platform === "reddit"
                          ? "bg-[#ff4500]/10 text-[#ff4500] border border-[#ff4500]/25"
                          : "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/25"
                      }`}
                    >
                      <span>{selectedScenario.tag}</span>
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 font-semibold">
                      {selectedScenario.timeAgo}
                    </span>
                  </div>

                  {/* Post Title */}
                  <h4
                    className={`text-base font-extrabold leading-snug ${
                      theme === "dark" ? "text-white" : "text-slate-950"
                    }`}
                  >
                    "{selectedScenario.title}"
                  </h4>

                  {/* Post Body */}
                  <p
                    className={`text-xs leading-relaxed font-medium ${
                      theme === "dark" ? "text-slate-300" : "text-slate-700"
                    }`}
                  >
                    {selectedScenario.body}
                  </p>
                </div>

                {/* Intent Score Bar */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-semibold text-slate-500">
                      Author: {selectedScenario.user}
                    </span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-amber-500" />
                      {selectedScenario.intentPercent}% High Buyer Intent
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${selectedScenario.intentPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: AI Sales Pitch Generator & Tone Switcher */}
              <div
                className={`rounded-2xl p-5 border space-y-4 flex flex-col justify-between ${
                  theme === "dark"
                    ? "bg-gradient-to-br from-[#131b2e] to-[#0d1322] border-indigo-500/30"
                    : "bg-gradient-to-br from-indigo-50/60 via-purple-50/40 to-white border-indigo-200 shadow-md"
                }`}
              >
                <div>
                  {/* Push Status & Tone Selector */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-white/10">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>AI Sales Pitch Drafter</span>
                    </div>

                    {/* Pitch Tone Tabs */}
                    <div className="flex items-center gap-1 text-[11px] font-bold">
                      <button
                        onClick={() => setPitchStyle("helpful")}
                        className={`px-2.5 py-1 rounded-lg transition-colors ${
                          pitchStyle === "helpful"
                            ? "bg-indigo-600 text-white"
                            : theme === "dark"
                            ? "bg-slate-800 text-slate-400 hover:text-white"
                            : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-300"
                        }`}
                      >
                        Helpful
                      </button>
                      <button
                        onClick={() => setPitchStyle("founder")}
                        className={`px-2.5 py-1 rounded-lg transition-colors ${
                          pitchStyle === "founder"
                            ? "bg-indigo-600 text-white"
                            : theme === "dark"
                            ? "bg-slate-800 text-slate-400 hover:text-white"
                            : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-300"
                        }`}
                      >
                        Founder Story
                      </button>
                      <button
                        onClick={() => setPitchStyle("direct")}
                        className={`px-2.5 py-1 rounded-lg transition-colors ${
                          pitchStyle === "direct"
                            ? "bg-indigo-600 text-white"
                            : theme === "dark"
                            ? "bg-slate-800 text-slate-400 hover:text-white"
                            : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-300"
                        }`}
                      >
                        Direct
                      </button>
                    </div>
                  </div>

                  {/* Generated Pitch Text Box */}
                  <div
                    className={`mt-3 p-3.5 rounded-xl border text-xs font-medium leading-relaxed ${
                      theme === "dark"
                        ? "bg-black/50 border-white/5 text-slate-200"
                        : "bg-white border-slate-200/90 text-slate-800 shadow-sm"
                    }`}
                  >
                    <p className="italic font-sans">
                      "{getCurrentPitchText()}"
                    </p>
                  </div>
                </div>

                {/* Notification Routing & Action Buttons */}
                <div className="pt-3 border-t border-slate-200 dark:border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="flex items-center gap-1 text-sky-600 dark:text-sky-400 font-bold">
                      <Send className="w-3 h-3" /> Telegram & Discord Ready
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      ✓ Zero Spam Risk
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleCopyPitch}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? "Copied to Clipboard!" : "Copy Pitch & Post"}</span>
                    </button>
                    <Link
                      href="/login"
                      className={`py-2.5 px-4 rounded-xl border text-xs font-bold transition-all ${
                        theme === "dark"
                          ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
                          : "bg-white hover:bg-slate-100 text-slate-800 border-slate-300 shadow-sm"
                      }`}
                    >
                      Test in App
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          HOW IT CONVERTS: 4-STEP WORKFLOW
          ========================================================= */}
      <section id="how-it-works" className="relative z-10 py-20 border-t border-slate-200 dark:border-white/5 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-500">4-Step Automation</h2>
          <h3
            className={`mt-2 text-3xl sm:text-4xl font-extrabold ${
              theme === "dark" ? "text-white" : "text-slate-950"
            }`}
          >
            How SignalPulse Delivers Deals While You Sleep
          </h3>
          <p className={`mt-3 text-sm sm:text-base font-medium ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>
            No manual scraping, no expensive enterprise seat licenses. Just real customers actively asking for what you built.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              step: "01",
              title: "Define Keywords",
              desc: "Enter high-intent phrases like 'alternative to X' or 'recommend tool for Y'.",
              icon: Target,
            },
            {
              step: "02",
              title: "24/7 Deep Radar",
              desc: "Zero-overhead worker listens to active Reddit JSON discussions & X syndication feeds.",
              icon: Radar,
            },
            {
              step: "03",
              title: "Anti-Spam AI Filter",
              desc: "Heuristic model scores intent (90%+) and automatically discards job ads and spam.",
              icon: Filter,
            },
            {
              step: "04",
              title: "Instant Mobile Alert",
              desc: "Pings your Telegram or Discord in <60s with ready-to-copy AI sales pitches.",
              icon: Send,
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bento-card rounded-3xl p-6 space-y-4 flash-card-glow text-left flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-extrabold px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                    STEP {item.step}
                  </span>
                  <item.icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h4
                  className={`text-lg font-bold ${
                    theme === "dark" ? "text-white" : "text-slate-950"
                  }`}
                >
                  {item.title}
                </h4>
                <p
                  className={`text-xs leading-relaxed font-medium ${
                    theme === "dark" ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================
          21st.dev BENTO GRID FEATURES
          ========================================================= */}
      <section id="bento" className="relative z-10 py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-500">Next-Gen Architecture</h2>
          <h3
            className={`mt-2 text-3xl sm:text-5xl font-extrabold ${
              theme === "dark" ? "text-white" : "text-slate-950"
            }`}
          >
            Built from the Ground Up to Convert
          </h3>
          <p className={`mt-3 text-sm sm:text-base font-medium ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>
            Everything you need to turn casual social chatter into instant customers without spending hours manually searching.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bento 1 */}
          <div className="md:col-span-2 bento-card rounded-3xl p-8 space-y-5 flash-card-glow text-left">
            <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <h4
              className={`text-2xl font-bold ${
                theme === "dark" ? "text-white" : "text-slate-950"
              }`}
            >
              Instant Push Alerts (Telegram & Discord)
            </h4>
            <p
              className={`text-sm leading-relaxed max-w-xl font-medium ${
                theme === "dark" ? "text-slate-300" : "text-slate-700"
              }`}
            >
              Why check a web dashboard every hour? SignalPulse routes leads straight to your Telegram bot or private Discord channel with direct link buttons. Pitch the buyer while the thread is still fresh.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="px-3 py-1 rounded-full border text-xs font-mono font-semibold bg-slate-500/5 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-800">
                Telegram Bot API
              </span>
              <span className="px-3 py-1 rounded-full border text-xs font-mono font-semibold bg-slate-500/5 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-800">
                Discord Webhooks
              </span>
              <span className="px-3 py-1 rounded-full border text-xs font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-bold">
                Sub-60s Latency
              </span>
            </div>
          </div>

          {/* Bento 2 */}
          <div className="bento-card rounded-3xl p-8 space-y-5 flash-card-glow text-left">
            <div className="h-12 w-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4
              className={`text-xl font-bold ${
                theme === "dark" ? "text-white" : "text-slate-950"
              }`}
            >
              1-Click AI Sales Pitch Drafter
            </h4>
            <p
              className={`text-sm leading-relaxed font-medium ${
                theme === "dark" ? "text-slate-300" : "text-slate-700"
              }`}
            >
              Don't sound like a corporate spammer. Our AI generates 3 customized, value-driven reply styles designed to pass strict community guidelines:
            </p>
            <div className="pt-1 text-xs text-indigo-600 dark:text-indigo-400 font-mono font-bold space-y-1">
              <p>• Helpful & Value-First (Advice focus)</p>
              <p>• Founder Story (Authentic solo maker)</p>
              <p>• Direct & Concise (Twitter-ready)</p>
            </div>
          </div>

          {/* Bento 3 */}
          <div className="bento-card rounded-3xl p-8 space-y-5 flash-card-glow text-left">
            <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Filter className="w-6 h-6" />
            </div>
            <h4
              className={`text-xl font-bold ${
                theme === "dark" ? "text-white" : "text-slate-950"
              }`}
            >
              Anti-Spam Intent Classifier
            </h4>
            <p
              className={`text-sm leading-relaxed font-medium ${
                theme === "dark" ? "text-slate-300" : "text-slate-700"
              }`}
            >
              Automatically discards job offers, hiring notices, and cracked software queries. Scores each post as High, Medium, or Low intent before buzzing your phone.
            </p>
          </div>

          {/* Bento 4 */}
          <div className="md:col-span-2 bento-card rounded-3xl p-8 space-y-5 flash-card-glow text-left">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4
              className={`text-2xl font-bold ${
                theme === "dark" ? "text-white" : "text-slate-950"
              }`}
            >
              Zero-Fee Reddit & X Scraping Engine
            </h4>
            <p
              className={`text-sm leading-relaxed max-w-xl font-medium ${
                theme === "dark" ? "text-slate-300" : "text-slate-700"
              }`}
            >
              Other platforms pass enormous API costs down to you. SignalPulse is engineered with resilient public search endpoints and rotating client signatures, keeping your operational costs at exactly $0.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="px-3 py-1 rounded-full border text-xs font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-bold">
                $0 API Overhead
              </span>
              <span className="px-3 py-1 rounded-full border text-xs font-mono font-semibold bg-slate-500/5 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-800">
                Public JSON Search Streams
              </span>
              <span className="px-3 py-1 rounded-full border text-xs font-mono font-semibold bg-slate-500/5 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-800">
                X (Twitter) Feed Adapter
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          DYNAMIC INTERACTIVE ROI CALCULATOR
          ========================================================= */}
      <section id="roi" className="relative z-10 py-20 border-t border-slate-200 dark:border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-500">Interactive Profit Simulator</h2>
            <h3
              className={`mt-2 text-3xl sm:text-4xl font-extrabold ${
                theme === "dark" ? "text-white" : "text-slate-950"
              }`}
            >
              Calculate Your Return on Investment
            </h3>
            <p className={`mt-2 text-sm font-medium ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>
              See how many deals you need to close to 10x your investment.
            </p>
          </div>

          <div
            className={`p-6 sm:p-8 rounded-3xl border text-left space-y-6 flash-card-glow ${
              theme === "dark"
                ? "bg-[#0d1322] border-indigo-500/30 shadow-2xl"
                : "bg-white border-slate-300 shadow-xl shadow-indigo-100/50"
            }`}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label
                  className={`block text-xs font-bold mb-2 ${
                    theme === "dark" ? "text-slate-200" : "text-slate-800"
                  }`}
                >
                  Your Product Price: <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">${productPrice}</span>
                </label>
                <input
                  type="range"
                  min="10"
                  max="200"
                  step="5"
                  value={productPrice}
                  onChange={(e) => setProductPrice(Number(e.target.value))}
                  className="w-full h-2 bg-indigo-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              <div>
                <label
                  className={`block text-xs font-bold mb-2 ${
                    theme === "dark" ? "text-slate-200" : "text-slate-800"
                  }`}
                >
                  Monthly High-Intent Leads Pitched: <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{monthlyLeadsEstimate} leads</span>
                </label>
                <input
                  type="range"
                  min="2"
                  max="50"
                  step="2"
                  value={monthlyLeadsEstimate}
                  onChange={(e) => setMonthlyLeadsEstimate(Number(e.target.value))}
                  className="w-full h-2 bg-indigo-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
            </div>

            {/* Calculated Results */}
            <div
              className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
                theme === "dark"
                  ? "bg-indigo-950/40 border-indigo-500/30"
                  : "bg-indigo-50/90 border-indigo-200"
              }`}
            >
              <div>
                <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wide">
                  Projected Extra Monthly Revenue (at 25% Close Rate):
                </span>
                <div
                  className={`text-3xl sm:text-4xl font-extrabold mt-1 ${
                    theme === "dark" ? "text-emerald-400" : "text-emerald-600"
                  }`}
                >
                  + ${Math.round(productPrice * (monthlyLeadsEstimate * 0.25))} / month
                </div>
                <p className="text-[11px] font-semibold text-slate-500 mt-1">
                  Saves ~14.5 hours of manual social media scrolling per week
                </p>
              </div>
              <Link
                href="/register"
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-md transition-all whitespace-nowrap"
              >
                Start {siteConfig.trialDays}-Day Free Trial &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          COMPARISON SECTION (Brand24 vs Mention vs SignalPulse)
          ========================================================= */}
      <section id="comparison" className="relative z-10 py-20 border-y border-slate-200 dark:border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-500">The Market Disruption</h2>
          <h3
            className={`mt-2 text-3xl sm:text-4xl font-extrabold ${
              theme === "dark" ? "text-white" : "text-slate-950"
            }`}
          >
            Why Indie Makers Switch Away from $100+/mo Tools
          </h3>
          <p className={`mt-3 max-w-2xl mx-auto text-sm sm:text-base font-medium ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>
            Stop paying enterprise prices for complex sentiment charts you never look at. Get actionable buyer leads instead.
          </p>

          <div className="mt-12 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="py-4 px-4 text-sm font-bold text-slate-700 dark:text-slate-400">Feature</th>
                  <th className="py-4 px-4 text-sm font-bold text-slate-700 dark:text-slate-400">Brand24</th>
                  <th className="py-4 px-4 text-sm font-bold text-slate-700 dark:text-slate-400">Mention</th>
                  <th
                    className={`py-4 px-4 text-sm font-extrabold text-indigo-600 dark:text-indigo-400 rounded-t-2xl border-x border-t ${
                      theme === "dark"
                        ? "bg-indigo-950/40 border-indigo-500/30"
                        : "bg-indigo-50 border-indigo-200"
                    }`}
                  >
                    SignalPulse (Us)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-sm">
                <tr>
                  <td className={`py-4 px-4 font-bold ${theme === "dark" ? "text-slate-200" : "text-slate-900"}`}>
                    Starting Price
                  </td>
                  <td className="py-4 px-4 text-rose-500 font-bold">$149 / month</td>
                  <td className="py-4 px-4 text-rose-500 font-bold">$99 / month</td>
                  <td
                    className={`py-4 px-4 font-extrabold border-x ${
                      theme === "dark"
                        ? "text-emerald-400 bg-indigo-950/40 border-indigo-500/30"
                        : "text-emerald-600 bg-indigo-50 border-indigo-200"
                    }`}
                  >
                    {siteConfig.trialDays}-Day Trial, then ${siteConfig.monthlyPrice}/mo or ${siteConfig.ltdPrice} LTD
                  </td>
                </tr>
                <tr>
                  <td className={`py-4 px-4 font-bold ${theme === "dark" ? "text-slate-200" : "text-slate-900"}`}>
                    Reddit & X Target Focus
                  </td>
                  <td className="py-4 px-4 text-slate-500 font-medium">Generic news & blogs</td>
                  <td className="py-4 px-4 text-slate-500 font-medium">Broad crawler</td>
                  <td
                    className={`py-4 px-4 font-bold border-x ${
                      theme === "dark"
                        ? "text-white bg-indigo-950/40 border-indigo-500/30"
                        : "text-slate-950 bg-indigo-50 border-indigo-200"
                    }`}
                  >
                    Direct buyer discussions
                  </td>
                </tr>
                <tr>
                  <td className={`py-4 px-4 font-bold ${theme === "dark" ? "text-slate-200" : "text-slate-900"}`}>
                    Instant Telegram & Discord
                  </td>
                  <td className="py-4 px-4 text-slate-500 font-medium">Requires Zapier</td>
                  <td className="py-4 px-4 text-slate-500 font-medium">Add-on cost</td>
                  <td
                    className={`py-4 px-4 font-bold border-x ${
                      theme === "dark"
                        ? "text-emerald-400 bg-indigo-950/40 border-indigo-500/30"
                        : "text-emerald-600 bg-indigo-50 border-indigo-200"
                    }`}
                  >
                    Built-in 1-Click Setup
                  </td>
                </tr>
                <tr>
                  <td className={`py-4 px-4 font-bold ${theme === "dark" ? "text-slate-200" : "text-slate-900"}`}>
                    AI Sales Pitch Drafter
                  </td>
                  <td className="py-4 px-4"><XCircle className="w-5 h-5 text-rose-500 inline" /></td>
                  <td className="py-4 px-4"><XCircle className="w-5 h-5 text-rose-500 inline" /></td>
                  <td
                    className={`py-4 px-4 font-bold border-x border-b rounded-b-2xl ${
                      theme === "dark"
                        ? "text-emerald-400 bg-indigo-950/40 border-indigo-500/30"
                        : "text-emerald-600 bg-indigo-50 border-indigo-200"
                    }`}
                  >
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 inline mr-1" /> Context-Aware Replies
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* =========================================================
          PRICING SECTION (Dynamic from SiteConfig CMS)
          ========================================================= */}
      <section id="pricing" className="relative z-10 py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-500">Sweet-Spot Pricing</h2>
        <h3
          className={`mt-2 text-3xl sm:text-5xl font-extrabold ${
            theme === "dark" ? "text-white" : "text-slate-950"
          }`}
        >
          Affordable Access for Solo Founders
        </h3>
        <p className={`mt-3 max-w-2xl mx-auto text-sm sm:text-base font-medium ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>
          Start with our {siteConfig.trialDays}-day unrestricted trial, then pay once or subscribe with flat transparent pricing.
        </p>

        {/* Pricing Toggle */}
        <div
          className={`mt-8 inline-flex items-center p-1.5 rounded-2xl border ${
            theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-300 shadow-sm"
          }`}
        >
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`px-5 py-2.5 text-sm font-extrabold rounded-xl transition-all ${
              billingCycle === "monthly"
                ? "bg-indigo-600 text-white shadow-md"
                : theme === "dark"
                ? "text-slate-400 hover:text-white"
                : "text-slate-700 hover:text-slate-950"
            }`}
          >
            Monthly (${siteConfig.monthlyPrice}/mo)
          </button>
          <button
            onClick={() => setBillingCycle("ltd")}
            className={`px-5 py-2.5 text-sm font-extrabold rounded-xl transition-all flex items-center gap-1.5 ${
              billingCycle === "ltd"
                ? "bg-indigo-600 text-white shadow-md"
                : theme === "dark"
                ? "text-slate-400 hover:text-white"
                : "text-slate-700 hover:text-slate-950"
            }`}
          >
            <span>Lifetime Deal (${siteConfig.ltdPrice} LTD)</span>
            <span className="text-[10px] bg-emerald-500 text-slate-950 font-extrabold px-2 py-0.5 rounded-full">
              BEST VALUE
            </span>
          </button>
        </div>

        {/* Pricing Cards */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto text-left">
          {/* Card 1: Free Trial */}
          <div className="bento-card rounded-3xl p-8 space-y-6 flex flex-col justify-between flash-card-glow">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                <Clock className="w-3.5 h-3.5" />
                <span>{siteConfig.trialDays}-Day Free Trial</span>
              </div>
              <div>
                <h4 className={`text-xl font-extrabold ${theme === "dark" ? "text-white" : "text-slate-950"}`}>
                  {siteConfig.trialDays}-Day Full Access
                </h4>
                <p className={`text-xs mt-1 font-medium ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
                  Full radar access for {siteConfig.trialDays} days. No credit card required.
                </p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className={`text-4xl font-extrabold ${theme === "dark" ? "text-white" : "text-slate-950"}`}>
                    $0
                  </span>
                  <span className={`text-xs font-semibold ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
                    / for {siteConfig.trialDays} days
                  </span>
                </div>
              </div>
              <ul className={`space-y-3 text-sm font-semibold ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>2 active keywords tracked</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Reddit & Twitter scanning</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>AI sales pitch generator</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Upgrade anytime after {siteConfig.trialDays} days</span>
                </li>
              </ul>
            </div>
            <Link
              href="/register"
              className={`w-full block text-center py-3.5 rounded-xl font-extrabold text-sm transition-colors border ${
                theme === "dark"
                  ? "bg-slate-800 hover:bg-slate-700 text-white border-slate-700"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-950 border-slate-300 shadow-sm"
              }`}
            >
              Start {siteConfig.trialDays}-Day Trial
            </Link>
          </div>

          {/* Card 2: Pro / LTD Pass (DUAL THEME LUXURY FLASH CARD) */}
          <div
            className={`relative rounded-3xl p-8 border-2 space-y-6 md:-translate-y-3 flex flex-col justify-between flash-card-glow shadow-2xl transition-all ${
              theme === "dark"
                ? "bg-gradient-to-b from-[#18243e] to-[#0f172a] border-indigo-500 text-white shadow-indigo-600/30"
                : "bg-gradient-to-b from-white via-indigo-50/50 to-indigo-100/40 border-indigo-600 text-slate-950 shadow-indigo-500/25"
            }`}
          >
            <div className="space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-600 text-white text-[11px] font-extrabold uppercase tracking-wide shadow-md">
                {billingCycle === "ltd" ? "Most Popular Founder Deal" : "Cancel Anytime"}
              </div>
              <div>
                <h4
                  className={`text-xl font-extrabold ${
                    theme === "dark" ? "text-white" : "text-slate-950"
                  }`}
                >
                  {billingCycle === "ltd" ? "Lifetime Founder Pass" : "Pro Monthly"}
                </h4>
                <p
                  className={`text-xs mt-1 font-semibold ${
                    theme === "dark" ? "text-indigo-300" : "text-indigo-800"
                  }`}
                >
                  {billingCycle === "ltd" ? "Pay once, monitor leads forever" : "Flexible monthly subscription"}
                </p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span
                    className={`text-5xl font-extrabold ${
                      theme === "dark" ? "text-white" : "text-slate-950"
                    }`}
                  >
                    {billingCycle === "ltd" ? `$${siteConfig.ltdPrice}` : `$${siteConfig.monthlyPrice}`}
                  </span>
                  <span
                    className={`text-xs font-bold ${
                      theme === "dark" ? "text-slate-300" : "text-slate-600"
                    }`}
                  >
                    {billingCycle === "ltd" ? "one-time payment" : "/ month"}
                  </span>
                </div>
              </div>
              <ul
                className={`space-y-3 text-sm font-semibold ${
                  theme === "dark" ? "text-slate-200" : "text-slate-800"
                }`}
              >
                <li className="flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Unlimited active keywords tracked</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Reddit & X (Twitter) real-time scanning</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Instant Telegram Bot & Discord Webhooks</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>1-Click AI Sales Pitch Drafter</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>High-Intent Lead Filter (No spam/jobs)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Zero ongoing API fees</span>
                </li>
              </ul>
            </div>
            <Link
              href="/login"
              className="w-full block text-center py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm shadow-lg shadow-indigo-600/40 transition-colors"
            >
              {billingCycle === "ltd" ? `Claim $${siteConfig.ltdPrice} Lifetime Access` : `Subscribe for $${siteConfig.monthlyPrice}/Month`}
            </Link>
          </div>

          {/* Card 3: Agency & Power */}
          <div className="bento-card rounded-3xl p-8 space-y-6 flex flex-col justify-between flash-card-glow">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                <span>Power Users</span>
              </div>
              <div>
                <h4 className={`text-xl font-extrabold ${theme === "dark" ? "text-white" : "text-slate-950"}`}>
                  Agency & Teams
                </h4>
                <p className={`text-xs mt-1 font-medium ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
                  For freelancers managing multiple client brands
                </p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className={`text-4xl font-extrabold ${theme === "dark" ? "text-white" : "text-slate-950"}`}>
                    ${siteConfig.agencyPrice}
                  </span>
                  <span className={`text-xs font-semibold ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
                    / lifetime
                  </span>
                </div>
              </div>
              <ul className={`space-y-3 text-sm font-semibold ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Everything in Lifetime Pass</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Multiple client brand profiles</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Multiple Telegram & Discord routing</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Priority ingestion frequency</span>
                </li>
              </ul>
            </div>
            <Link
              href="/login"
              className={`w-full block text-center py-3.5 rounded-xl font-extrabold text-sm transition-colors border ${
                theme === "dark"
                  ? "bg-slate-800 hover:bg-slate-700 text-white border-slate-700"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-950 border-slate-300 shadow-sm"
              }`}
            >
              Get Agency Pass
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================
          ACCORDION FAQ SECTION
          ========================================================= */}
      <section id="faq" className="relative z-10 py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h3
          className={`text-3xl font-extrabold text-center mb-12 ${
            theme === "dark" ? "text-white" : "text-slate-950"
          }`}
        >
          Frequently Asked Questions
        </h3>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bento-card rounded-2xl overflow-hidden cursor-pointer"
              onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
            >
              <div className="p-6 flex items-center justify-between">
                <h4 className={`font-extrabold text-base ${theme === "dark" ? "text-white" : "text-slate-950"}`}>
                  {faq.q}
                </h4>
                <ChevronDown
                  className={`w-5 h-5 transition-transform duration-200 ${
                    activeFaq === idx ? "rotate-180 text-indigo-600 dark:text-indigo-400" : "text-slate-500"
                  }`}
                />
              </div>
              {activeFaq === idx && (
                <div
                  className={`px-6 pb-6 text-sm leading-relaxed border-t pt-4 font-medium ${
                    theme === "dark"
                      ? "text-slate-300 border-white/5"
                      : "text-slate-700 border-slate-200"
                  }`}
                >
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================
          FOOTER (with discrete Staff Gateway)
          ========================================================= */}
      <footer
        className={`relative z-10 border-t py-12 text-center text-xs ${
          theme === "dark"
            ? "border-white/[0.08] text-slate-400"
            : "border-slate-200 text-slate-600 bg-white"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2 font-semibold">
            <Radar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className={`font-bold ${theme === "dark" ? "text-slate-200" : "text-slate-900"}`}>
              SignalPulse
            </span>
            <span>© 2026. Built for Indie Makers & Founders.</span>
          </div>
          <div className="flex items-center space-x-6 font-semibold">
            <Link href="/login" className="hover:text-indigo-600 transition-colors">Client App</Link>
            <a href="#pricing" className="hover:text-indigo-600 transition-colors">Pricing</a>
            <Link href="/admin/login" className="hover:text-amber-500 transition-colors font-mono">
              Admin Gateway &rarr;
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
