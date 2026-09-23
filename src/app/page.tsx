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
  Menu,
  X,
} from "lucide-react";
import { StackSpread } from "@/components/ui/stack-spread";

interface SiteConfigData {
  heroHeadline: string;
  heroSubtitle: string;
  announcementText: string;
  ctaButtonText?: string;
  telegramBotUrl?: string;
  supportEmail?: string;
  monthlyPrice: number;
  ltdPrice: number;
  agencyPrice: number;
  stripeMonthlyLink?: string;
  stripeLtdLink?: string;
  stripeAgencyLink?: string;
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
    founderPitch: "Hey Dan, solo builder here! I got frustrated paying $149/mo just to track 3 Reddit keywords, so I built BuzzScout. Scans 24/7 and pings your Telegram for $5/mo. Happy to give you extended access if helpful!",
    directPitch: "BuzzScout monitors Reddit & X keywords in real-time with zero API fees for $5/mo. Direct Telegram & Discord pings in under 60 seconds with 1-click AI replies.",
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
    founderPitch: "Built an indie solution for this exact table extraction bottleneck after getting burned by per-page invoices. Check out BuzzScout's founder suite for fast integrations!",
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
    founderPitch: "That exact insight drove me to build BuzzScout! We filter for pain-point keywords and ping your phone the moment a thread opens so you can reply authentically.",
    directPitch: "BuzzScout detects competitor complaint keywords on Reddit & X 24/7. Instant mobile alerts let you join the conversation first.",
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
    founderPitch: "We spent weeks perfecting this exact dual-theme glassmorphic architecture for BuzzScout. Feel free to inspect our layout for inspiration!",
    directPitch: "Luxury glassmorphic design system with full dark and light mode support and zero text contrast flaws.",
  },
];

export default function LandingPage() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  
  // Interactive Live Studio State
  const [selectedScenario, setSelectedScenario] = useState<DemoScenario>(DEMO_SCENARIOS[0]);
  const [pitchStyle, setPitchStyle] = useState<"helpful" | "founder" | "direct">("founder");
  const [copied, setCopied] = useState(false);
  const [terminalCopied, setTerminalCopied] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Dynamic Site Config from Admin Portal
  const [siteConfig, setSiteConfig] = useState<SiteConfigData>({
    heroHeadline: "Turn Social Conversations Into High-Paying Verified Buyers 2026.",
    heroSubtitle: "Monitor high-intent phrases like 'looking for alternative to X' or 'recommend tool for Y'. Get instant mobile alerts on Telegram & Discord with ready-to-pitch AI replies in under 60 seconds.",
    announcementText: "Disrupting Traditional Monitors — Claim $25 Lifetime Access Now",
    ctaButtonText: "Launch Radar",
    telegramBotUrl: "https://t.me/BotFather",
    supportEmail: "support@buzzscout.io",
    monthlyPrice: 5,
    ltdPrice: 25,
    agencyPrice: 79,
    stripeMonthlyLink: "",
    stripeLtdLink: "",
    stripeAgencyLink: "",
  });

  // Dynamic Profit Calculator state
  const [productPrice, setProductPrice] = useState(39);
  const [monthlyLeadsEstimate, setMonthlyLeadsEstimate] = useState(8);

  useEffect(() => {
    fetch("/api/site-config", {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.heroHeadline) {
          setSiteConfig({
            heroHeadline: data.heroHeadline,
            heroSubtitle: data.heroSubtitle,
            announcementText: data.announcementText,
            ctaButtonText: data.ctaButtonText || "Launch Radar",
            telegramBotUrl: data.telegramBotUrl || "https://t.me/BotFather",
            supportEmail: data.supportEmail || "support@buzzscout.io",
            monthlyPrice: data.monthlyPrice ?? 5,
            ltdPrice: data.ltdPrice ?? 35,
            agencyPrice: data.agencyPrice ?? 79,
            stripeMonthlyLink: data.stripeMonthlyLink || "",
            stripeLtdLink: data.stripeLtdLink || "",
            stripeAgencyLink: data.stripeAgencyLink || "",
          });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
    }
  }, [theme]);

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

  const handleCopyTerminal = () => {
    navigator.clipboard.writeText('buzzscout listen --keyword "alternative to" --instant-alerts');
    setTerminalCopied(true);
    setTimeout(() => setTerminalCopied(false), 2200);
  };

  const faqs = [
    {
      q: "How does BuzzScout subscription & lifetime access work?",
      a: `You can choose between our flexible $${siteConfig.monthlyPrice}/month Pro subscription (cancel anytime with 1 click) or lock in our most popular $${siteConfig.ltdPrice} Lifetime Founder Pass with zero recurring fees forever. Both plans activate immediately upon payment with a 14-day satisfaction guarantee.`,
    },
    {
      q: "Do I need to pay for expensive Reddit or Twitter API access?",
      a: "No! BuzzScout is engineered with zero-overhead public search ingestion for Reddit, requiring $0 official API fees. For Twitter/X, it uses intelligent open search syndication or lets you optionally add your own bearer token.",
    },
    {
      q: "How fast do notifications arrive on Telegram and Discord?",
      a: "BuzzScout scans active discussions round-the-clock. As soon as a matching high-intent buyer query goes live, your Telegram bot or Discord channel pings your phone in under 60 seconds.",
    },
    {
      q: "Will Reddit or X flag my account for replying?",
      a: "No, because BuzzScout never uses automated spam bots to post replies. Instead, it alerts you privately and drafts a high-value, authentic reply that you can review, copy, and post organically from your own personal account.",
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
            {/* Dual Aurora Glow: Royal Blue on Left, Sunset Amber on Right */}
            <div className="absolute -top-24 -left-32 w-[650px] h-[650px] aurora-glow-left rounded-full blur-[130px] opacity-80" />
            <div className="absolute -top-10 -right-32 w-[650px] h-[650px] aurora-glow-right rounded-full blur-[130px] opacity-75" />
            <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-radial-glow blur-[100px] opacity-60" />
            <div className="absolute top-1/3 -left-48 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[140px]" />
            <div className="absolute top-2/3 -right-48 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px]" />
          </>
        ) : (
          <>
            <div className="absolute -top-24 -left-32 w-[650px] h-[650px] bg-blue-200/40 rounded-full blur-[130px]" />
            <div className="absolute -top-10 -right-32 w-[650px] h-[650px] bg-amber-200/40 rounded-full blur-[130px]" />
            <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gradient-to-b from-indigo-300/20 via-purple-300/15 to-transparent rounded-full blur-[120px]" />
            <div className="absolute top-1/3 -left-48 w-[500px] h-[500px] bg-sky-200/40 rounded-full blur-[140px]" />
            <div className="absolute top-2/3 -right-48 w-[500px] h-[500px] bg-indigo-200/30 rounded-full blur-[140px]" />
          </>
        )}
      </div>

      {/* Floating Glassmorphic Header (100% Mobile Aligned & Responsive) */}
      <header
        className={`sticky top-0 z-50 backdrop-blur-2xl border-b transition-all duration-300 ${
          theme === "dark"
            ? "bg-[#070a12]/90 border-white/[0.08] shadow-2xl shadow-black/40"
            : "bg-white/90 border-slate-200/90 shadow-sm shadow-slate-900/5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2">
          {/* Logo (Proportioned for Mobile) */}
          <Link href="/" className="flex items-center space-x-2 sm:space-x-2.5 group shrink-0">
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 flex items-center justify-center shadow-md shadow-indigo-600/30 group-hover:scale-105 transition-transform duration-300 border border-indigo-400/30">
              <Radar className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white animate-pulse" />
            </div>
            <span
              className={`text-base sm:text-lg md:text-xl font-extrabold tracking-tight ${
                theme === "dark" ? "text-white" : "text-slate-950"
              }`}
            >
              BuzzScout
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav
            className={`hidden md:flex items-center space-x-6 lg:space-x-8 text-xs lg:text-sm font-semibold ${
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

          {/* Actions: Theme Toggle + Desktop Auth + High-Visibility Mobile Hamburger */}
          <div className="flex items-center space-x-1.5 sm:space-x-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className={`p-2 sm:p-2.5 rounded-xl border transition-all duration-200 flex items-center gap-1.5 text-xs font-bold ${
                theme === "dark"
                  ? "bg-slate-900/90 border-slate-700 text-amber-400 hover:bg-slate-800 hover:border-amber-400/40 shadow-inner"
                  : "bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200 shadow-sm"
              }`}
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? (
                <>
                  <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
                  <span className="hidden md:inline text-slate-200 text-[11px]">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600" />
                  <span className="hidden md:inline text-slate-800 text-[11px]">Dark</span>
                </>
              )}
            </button>

            {/* Desktop-Only Sign In Link */}
            <Link
              href="/login"
              className={`hidden md:inline-flex text-xs lg:text-sm font-bold px-3 py-1.5 transition-colors ${
                theme === "dark"
                  ? "text-slate-300 hover:text-white"
                  : "text-slate-700 hover:text-slate-950"
              }`}
            >
              Sign In
            </Link>

            {/* Desktop-Only Launch Radar CTA */}
            <Link
              href="/dashboard"
              className="hidden sm:inline-flex relative items-center justify-center p-[1px] overflow-hidden rounded-xl font-bold transition-all group shrink-0"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl group-hover:opacity-100 transition-opacity" />
              <span
                className={`relative px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-bold rounded-[11px] transition-all duration-200 flex items-center gap-1.5 ${
                  theme === "dark"
                    ? "text-white bg-[#0a0f1d] group-hover:bg-opacity-80"
                    : "text-white bg-indigo-600 group-hover:bg-indigo-700"
                }`}
              >
                <span>{siteConfig.ctaButtonText || "Launch Radar"}</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </Link>

            {/* Prominent High-Visibility Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden flex items-center justify-center p-2 sm:p-2.5 rounded-xl border transition-all shrink-0 ${
                mobileMenuOpen
                  ? "bg-rose-500/15 border-rose-500/40 text-rose-400"
                  : theme === "dark"
                  ? "bg-indigo-600/15 border-indigo-500/40 text-indigo-300 hover:bg-indigo-600/25 shadow-md shadow-indigo-950/50"
                  : "bg-indigo-50 border-indigo-300 text-indigo-700 hover:bg-indigo-100 shadow-sm"
              }`}
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-rose-400 stroke-[2.5]" />
              ) : (
                <Menu className="w-5 h-5 stroke-[2.5]" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation Menu (Touch-Optimized & Perfectly Aligned) */}
      {mobileMenuOpen && (
        <div
          className={`md:hidden fixed inset-x-0 top-14 sm:top-16 z-40 border-b px-5 py-5 space-y-4 backdrop-blur-2xl transition-all shadow-2xl overflow-y-auto max-h-[calc(100vh-4rem)] ${
            theme === "dark"
              ? "bg-[#0b101d]/98 border-slate-800 text-slate-200 shadow-black/80"
              : "bg-white/98 border-slate-200 text-slate-900 shadow-slate-900/10"
          }`}
        >
          <nav className="flex flex-col space-y-1 text-xs sm:text-sm font-semibold">
            <a
              href="#interactive-radar"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-white/5 rounded-lg px-3 py-2 transition-colors flex items-center justify-between border-b border-slate-100 dark:border-white/5"
            >
              <span>Live Radar Simulator</span>
              <span className="text-[10px] font-mono font-bold text-emerald-500">LIVE</span>
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-white/5 rounded-lg px-3 py-2 transition-colors border-b border-slate-100 dark:border-white/5"
            >
              Workflow Automation
            </a>
            <a
              href="#bento"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-white/5 rounded-lg px-3 py-2 transition-colors border-b border-slate-100 dark:border-white/5"
            >
              Architecture & Features
            </a>
            <a
              href="#roi"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-white/5 rounded-lg px-3 py-2 transition-colors border-b border-slate-100 dark:border-white/5"
            >
              ROI Calculator
            </a>
            <a
              href="#comparison"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-white/5 rounded-lg px-3 py-2 transition-colors border-b border-slate-100 dark:border-white/5"
            >
              Market Comparison
            </a>
            <a
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-white/5 rounded-lg px-3 py-2 transition-colors border-b border-slate-100 dark:border-white/5 flex items-center justify-between"
            >
              <span>Pricing &amp; Founder Plans</span>
              <span className="text-[10px] font-mono font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">$25 LTD</span>
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-white/5 rounded-lg px-3 py-2 transition-colors"
            >
              FAQ
            </a>
          </nav>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-2.5">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className={`py-2.5 text-center text-xs font-bold rounded-xl border transition-colors ${
                theme === "dark"
                  ? "border-slate-700 text-slate-200 bg-slate-900 hover:bg-slate-800"
                  : "border-slate-300 text-slate-900 bg-slate-100 hover:bg-slate-200"
              }`}
            >
              Sign In
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 text-center text-xs font-extrabold rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-500 hover:to-violet-500 shadow-md shadow-indigo-600/30"
            >
              Get Started Now
            </Link>
          </div>
        </div>
      )}

      {/* Hero Section (Dynamically powered by SiteConfig CMS & 3D Developer Design) */}
      <section className="relative z-10 pt-16 pb-16 md:pt-24 md:pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Dynamic Shimmer Announcement Bar */}
        <div
          className={`inline-flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-full border text-[11px] sm:text-xs md:text-sm font-semibold mb-6 sm:mb-8 shadow-xl transition-transform hover:scale-[1.01] max-w-full text-center ${
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
          className={`text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-5xl mx-auto leading-[1.2] sm:leading-[1.15] ${
            theme === "dark"
              ? "text-white"
              : "text-slate-950"
          }`}
        >
          {siteConfig.heroHeadline}
        </h1>

        {/* Dynamic Hero Subtitle */}
        <p
          className={`mt-4 sm:mt-6 text-xs sm:text-base md:text-lg max-w-3xl mx-auto leading-relaxed font-medium px-2 sm:px-0 ${
            theme === "dark" ? "text-slate-300" : "text-slate-700"
          }`}
        >
          {siteConfig.heroSubtitle}
        </p>

        {/* Interactive Developer CLI Command Bar */}
        <div className="mt-8 flex items-center justify-center">
          <div
            onClick={handleCopyTerminal}
            className={`group inline-flex items-center gap-3 px-4 sm:px-5 py-2.5 rounded-2xl border font-mono text-xs sm:text-sm cursor-pointer transition-all duration-200 shadow-xl ${
              theme === "dark"
                ? "bg-[#090e1a]/90 hover:bg-[#0d1424] border-slate-700/80 hover:border-orange-500/50 text-slate-200 shadow-black/60"
                : "bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-100 shadow-slate-300"
            }`}
            title="Click to copy CLI command"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-orange-400 font-bold">$</span>
              <span className="text-slate-100 font-semibold">buzzscout listen</span>
              <span className="text-orange-400">--keyword</span>
              <span className="text-emerald-400">&quot;alternative to&quot;</span>
              <span className="text-blue-400 hidden sm:inline">--instant-alerts</span>
              <span className="terminal-cursor" />
            </div>
            <div className="ml-2 pl-2 border-l border-white/10 text-slate-400 group-hover:text-white flex items-center gap-1 text-[11px] font-sans font-bold">
              {terminalCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Hero CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#pricing"
            className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs sm:text-sm md:text-base shadow-xl shadow-blue-600/30 hover:shadow-blue-600/50 transition-all duration-200 flex items-center justify-center gap-2 developer-card-3d group"
          >
            <span>{siteConfig.ctaButtonText || "Launch Radar"}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
          <a
            href="#interactive-radar"
            className={`w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl border font-bold text-xs sm:text-sm md:text-base transition-all flex items-center justify-center gap-2 developer-card-3d ${
              theme === "dark"
                ? "backdrop-blur-xl border-white/15 bg-white/5 hover:bg-white/10 text-slate-100 shadow-lg"
                : "bg-white hover:bg-slate-50 text-slate-900 border-slate-300 shadow-md"
            }`}
          >
            <Zap className="w-4 h-4 text-amber-500" />
            <span>View Live Simulator</span>
          </a>
        </div>

        {/* Social Proof Badges */}
        <div
          className={`mt-10 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm font-semibold ${
            theme === "dark" ? "text-slate-300" : "text-slate-700"
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Instant 60-Second Setup • No Hidden Fees</span>
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

        {/* Multi-Stage Acquisition Pipeline */}
        <StackSpread theme={theme} />

        {/* =========================================================
            CREATIVE INTERACTIVE RADAR & AI PITCH STUDIO (100% Mobile Padded & Proportioned)
            ========================================================= */}
        <div id="interactive-radar" className="mt-12 sm:mt-16 max-w-5xl mx-auto text-left px-3 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                  Interactive Live Lead Simulator
                </span>
              </div>
              <h3
                className={`text-base sm:text-xl font-extrabold mt-1 tracking-tight ${
                  theme === "dark" ? "text-white" : "text-slate-950"
                }`}
              >
                Live Lead Detection &amp; Instant AI Replies
              </h3>
            </div>

            {/* Scenario Category Tabs (Touch-Friendly Horizontal Scroll) */}
            <div
              className={`flex items-center p-1 rounded-xl sm:rounded-2xl border text-[11px] sm:text-xs font-bold overflow-x-auto no-scrollbar max-w-full whitespace-nowrap gap-1 ${
                theme === "dark"
                  ? "bg-slate-900/90 border-slate-800"
                  : "bg-white border-slate-300 shadow-sm"
              }`}
            >
              {DEMO_SCENARIOS.map((sc) => (
                <button
                  key={sc.id}
                  onClick={() => setSelectedScenario(sc)}
                  className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl transition-all shrink-0 ${
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

          {/* Interactive Studio Glass Container with Ample Mobile Padding */}
          <div
            className={`rounded-2xl sm:rounded-3xl border p-3.5 sm:p-6 lg:p-8 flash-card-glow shadow-2xl transition-all ${
              theme === "dark"
                ? "bg-[#0c1220]/90 border-indigo-500/30 shadow-indigo-950/40"
                : "bg-white/95 border-slate-300 shadow-xl shadow-indigo-100/50"
            }`}
          >
            {/* Top Bar: Live Scanner Indicator & Trigger Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 sm:pb-6 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="relative flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shrink-0">
                  <Radar className={`w-4 h-4 sm:w-5 sm:h-5 ${isScanning ? "animate-spin text-amber-500" : "animate-pulse"}`} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      Status:
                    </span>
                    <span className="text-[10px] sm:text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                      {isScanning ? "Filtering Live Streams..." : "24/7 Radar Active"}
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-400 font-mono">
                    Ingesting public Reddit JSON &amp; X search feeds
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSimulateScan}
                  disabled={isScanning}
                  className="w-full sm:w-auto px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] sm:text-xs font-bold transition-all shadow-md shadow-indigo-600/30 flex items-center justify-center gap-1.5 shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isScanning ? "Scanning..." : "Trigger Live Scan"}</span>
                </button>
              </div>
            </div>

            {/* Split View: Live Buyer Post (Left) vs AI Reply Generator (Right) */}
            <div className="mt-4 sm:mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Left Column: The Detected Buyer Discussion */}
              <div
                className={`rounded-xl sm:rounded-2xl p-3.5 sm:p-5 border space-y-3 sm:space-y-4 flex flex-col justify-between ${
                  theme === "dark"
                    ? "bg-slate-900/80 border-slate-800"
                    : "bg-slate-50/90 border-slate-200/90 shadow-sm"
                }`}
              >
                <div className="space-y-2.5">
                  {/* Platform & Intent Badges */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-lg text-[10px] sm:text-xs font-bold ${
                        selectedScenario.platform === "reddit"
                          ? "bg-[#ff4500]/10 text-[#ff4500] border border-[#ff4500]/25"
                          : "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/25"
                      }`}
                    >
                      <span>{selectedScenario.tag}</span>
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-mono text-slate-500 font-semibold">
                      {selectedScenario.timeAgo}
                    </span>
                  </div>

                  {/* Post Title */}
                  <h4
                    className={`text-xs sm:text-sm md:text-base font-bold leading-snug ${
                      theme === "dark" ? "text-white" : "text-slate-950"
                    }`}
                  >
                    "{selectedScenario.title}"
                  </h4>

                  {/* Post Body */}
                  <p
                    className={`text-[11px] sm:text-xs leading-relaxed font-medium line-clamp-3 sm:line-clamp-none ${
                      theme === "dark" ? "text-slate-300" : "text-slate-700"
                    }`}
                  >
                    {selectedScenario.body}
                  </p>
                </div>

                {/* Intent Score Bar */}
                <div className="pt-2.5 sm:pt-3 border-t border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-[10px] sm:text-xs">
                    <span className="font-mono font-semibold text-slate-500">
                      Author: {selectedScenario.user}
                    </span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Flame className="w-3 h-3 text-amber-500" />
                      {selectedScenario.intentPercent}% High Intent
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
                className={`rounded-xl sm:rounded-2xl p-3.5 sm:p-5 border space-y-3 sm:space-y-4 flex flex-col justify-between ${
                  theme === "dark"
                    ? "bg-gradient-to-br from-[#131b2e] to-[#0d1322] border-indigo-500/30"
                    : "bg-gradient-to-br from-indigo-50/60 via-purple-50/40 to-white border-indigo-200 shadow-md"
                }`}
              >
                <div>
                  {/* Push Status & Tone Selector */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 sm:pb-3 border-b border-slate-200 dark:border-white/10">
                    <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>AI Sales Pitch Drafter</span>
                    </div>

                    {/* Pitch Tone Tabs */}
                    <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold">
                      <button
                        onClick={() => setPitchStyle("helpful")}
                        className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg transition-colors ${
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
                        className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg transition-colors ${
                          pitchStyle === "founder"
                            ? "bg-indigo-600 text-white"
                            : theme === "dark"
                            ? "bg-slate-800 text-slate-400 hover:text-white"
                            : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-300"
                        }`}
                      >
                        Founder
                      </button>
                      <button
                        onClick={() => setPitchStyle("direct")}
                        className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg transition-colors ${
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
                    className={`mt-2.5 p-3 rounded-xl border text-[11px] sm:text-xs font-medium leading-relaxed ${
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
                <div className="pt-2.5 sm:pt-3 border-t border-slate-200 dark:border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono">
                    <span className="flex items-center gap-1 text-sky-600 dark:text-sky-400 font-bold">
                      <Send className="w-3 h-3" /> Telegram &amp; Discord Ready
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      ✓ Zero Spam
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={handleCopyPitch}
                      className="w-full sm:flex-1 py-2 sm:py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? "Copied!" : "Copy Pitch & Post"}</span>
                    </button>
                    <Link
                      href="/login"
                      className={`w-full sm:w-auto py-2 sm:py-2.5 px-3.5 rounded-xl border text-xs font-bold transition-all text-center ${
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
            How BuzzScout Delivers Deals While You Sleep
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
                  <span
                    className={`text-xs font-mono font-extrabold px-2.5 py-1 rounded-lg border transition-all ${
                      theme === "dark"
                        ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                        : "bg-indigo-50 text-indigo-950 border-indigo-200 shadow-sm"
                    }`}
                  >
                    STEP {item.step}
                  </span>
                  <item.icon className={`w-5 h-5 ${theme === "dark" ? "text-indigo-400" : "text-indigo-600"}`} />
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
          EXECUTIVE BENTO GRID FEATURES
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
              Why check a web dashboard every hour? BuzzScout routes leads straight to your Telegram bot or private Discord channel with direct link buttons. Pitch the buyer while the thread is still fresh.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span
                className={`px-3.5 py-1.5 rounded-full border text-xs font-mono font-bold transition-all ${
                  theme === "dark"
                    ? "bg-slate-800/80 text-slate-200 border-slate-700/80"
                    : "bg-white text-slate-950 border-slate-300 shadow-sm"
                }`}
              >
                Telegram Bot API
              </span>
              <span
                className={`px-3.5 py-1.5 rounded-full border text-xs font-mono font-bold transition-all ${
                  theme === "dark"
                    ? "bg-slate-800/80 text-slate-200 border-slate-700/80"
                    : "bg-white text-slate-950 border-slate-300 shadow-sm"
                }`}
              >
                Discord Webhooks
              </span>
              <span
                className={`px-3.5 py-1.5 rounded-full border text-xs font-mono font-bold transition-all ${
                  theme === "dark"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-emerald-50 text-emerald-900 border-emerald-300 shadow-sm"
                }`}
              >
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
            <div
              className={`pt-1 text-xs font-mono font-bold space-y-1 ${
                theme === "dark" ? "text-indigo-400" : "text-indigo-900"
              }`}
            >
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
              Other platforms pass enormous API costs down to you. BuzzScout is engineered with resilient public search endpoints and rotating client signatures, keeping your operational costs at exactly $0.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span
                className={`px-3.5 py-1.5 rounded-full border text-xs font-mono font-bold transition-all ${
                  theme === "dark"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-emerald-50 text-emerald-900 border-emerald-300 shadow-sm"
                }`}
              >
                $0 API Overhead
              </span>
              <span
                className={`px-3.5 py-1.5 rounded-full border text-xs font-mono font-bold transition-all ${
                  theme === "dark"
                    ? "bg-slate-800/80 text-slate-200 border-slate-700/80"
                    : "bg-white text-slate-950 border-slate-300 shadow-sm"
                }`}
              >
                Public JSON Search Streams
              </span>
              <span
                className={`px-3.5 py-1.5 rounded-full border text-xs font-mono font-bold transition-all ${
                  theme === "dark"
                    ? "bg-slate-800/80 text-slate-200 border-slate-700/80"
                    : "bg-white text-slate-950 border-slate-300 shadow-sm"
                }`}
              >
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
              <a
                href="#pricing"
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-md transition-all whitespace-nowrap"
              >
                Get Started Now &rarr;
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          COMPARISON SECTION (Brand24 vs Mention vs BuzzScout)
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

          <div className="mt-8 sm:mt-12 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
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
                    BuzzScout (Us)
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
                    ${siteConfig.monthlyPrice}/mo or ${siteConfig.ltdPrice} Lifetime Deal (Zero Recurring Fees)
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
          Choose the plan that fits your growth. Flexible monthly subscription or lock in lifetime access with our LTD founder pass.
        </p>

        {/* Pricing Cards Grid (2 Paid Tiers — Pro & Lifetime Pass) */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
          {/* Card 1: Pro Monthly */}
          <div className="bento-card rounded-3xl p-8 space-y-6 flex flex-col justify-between flash-card-glow">
            <div className="space-y-6">
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                  theme === "dark"
                    ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                    : "bg-indigo-50 text-indigo-950 border-indigo-200 shadow-sm"
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-indigo-500" />
                <span>Flexible Subscription</span>
              </div>
              <div>
                <h4 className={`text-xl font-extrabold ${theme === "dark" ? "text-white" : "text-slate-950"}`}>
                  Pro Monthly
                </h4>
                <p className={`text-xs mt-1 font-medium ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
                  Ideal for solo builders and indie founders. Cancel anytime.
                </p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className={`text-4xl font-extrabold ${theme === "dark" ? "text-white" : "text-slate-950"}`}>
                    ${siteConfig.monthlyPrice}
                  </span>
                  <span className={`text-xs font-semibold ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
                    / month
                  </span>
                </div>
              </div>
              <ul className={`space-y-3 text-sm font-semibold ${theme === "dark" ? "text-slate-300" : "text-slate-700"}`}>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>10 active keywords tracked</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Reddit & Twitter (X) real-time scanning</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Sub-60s Telegram & Discord alerts</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>1-Click AI Sales Pitch Generator</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Zero API fees & cancel anytime</span>
                </li>
              </ul>
            </div>
            <a
              href={siteConfig.stripeMonthlyLink || "/register?plan=PRO"}
              className={`w-full block text-center py-3.5 rounded-xl font-extrabold text-sm transition-colors border ${
                theme === "dark"
                  ? "bg-slate-800 hover:bg-slate-700 text-white border-slate-700"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-950 border-slate-300 shadow-sm"
              }`}
            >
              Subscribe for ${siteConfig.monthlyPrice}/Month
            </a>
          </div>

          {/* Card 2: Lifetime Founder Pass (DUAL THEME LUXURY FLASH CARD) */}
          <div
            className={`relative rounded-3xl p-8 border-2 space-y-6 md:-translate-y-3 flex flex-col justify-between flash-card-glow shadow-2xl transition-all ${
              theme === "dark"
                ? "bg-gradient-to-b from-[#18243e] to-[#0f172a] border-indigo-500 text-white shadow-indigo-600/30"
                : "bg-gradient-to-b from-white via-indigo-50/50 to-indigo-100/40 border-indigo-600 text-slate-950 shadow-indigo-500/25"
            }`}
          >
            <div className="space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-600 text-white text-[11px] font-extrabold uppercase tracking-wide shadow-md">
                <span>MOST POPULAR • LIFETIME DEAL</span>
              </div>
              <div>
                <h4
                  className={`text-xl font-extrabold ${
                    theme === "dark" ? "text-white" : "text-slate-950"
                  }`}
                >
                  Lifetime Founder Pass
                </h4>
                <p
                  className={`text-xs mt-1 font-semibold ${
                    theme === "dark" ? "text-indigo-300" : "text-indigo-800"
                  }`}
                >
                  Pay once, monitor leads forever — zero monthly fees
                </p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span
                    className={`text-5xl font-extrabold ${
                      theme === "dark" ? "text-white" : "text-slate-950"
                    }`}
                  >
                    ${siteConfig.ltdPrice}
                  </span>
                  <span
                    className={`text-xs font-bold ${
                      theme === "dark" ? "text-slate-300" : "text-slate-600"
                    }`}
                  >
                    one-time payment
                  </span>
                </div>
              </div>
              <ul
                className={`space-y-3 text-sm font-semibold ${
                  theme === "dark" ? "text-slate-200" : "text-slate-800"
                }`}
              >
                <li className="flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Unlimited active keywords tracked</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Reddit & X (Twitter) real-time scanning</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Instant Telegram Bot & Discord Webhooks</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>1-Click AI Sales Pitch Drafter (GPT-4o)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>High-Intent Lead Filter (No spam/jobs)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>All future platform updates & founder perks</span>
                </li>
              </ul>
            </div>
            <a
              href={siteConfig.stripeLtdLink || "/register?plan=LTD"}
              className="w-full block text-center py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm shadow-lg shadow-indigo-600/40 transition-colors"
            >
              Claim ${siteConfig.ltdPrice} Lifetime Access &rarr;
            </a>
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
          FOOTER
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
              BuzzScout
            </span>
            <span>© 2026. All rights reserved.</span>
          </div>
          <div className="flex items-center space-x-6 font-semibold">
            <Link href="/login" className="hover:text-indigo-600 transition-colors">Sign In</Link>
            <a href="#pricing" className="hover:text-indigo-600 transition-colors">Pricing</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
