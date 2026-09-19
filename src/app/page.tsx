"use client";

import { useState } from "react";
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
  Coins,
} from "lucide-react";

export default function LandingPage() {
  // Theme state: "dark" | "light"
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "ltd">("ltd");
  const [demoKeyword, setDemoKeyword] = useState("alternative to notion");
  const [simulatedMatch, setSimulatedMatch] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Dynamic ROI Calculator state
  const [productPrice, setProductPrice] = useState(39);
  const [monthlyLeadsEstimate, setMonthlyLeadsEstimate] = useState(8);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleSimulate = () => {
    setSimulatedMatch(true);
    setTimeout(() => setSimulatedMatch(false), 3500);
  };

  const handleCopySamplePitch = () => {
    navigator.clipboard.writeText(
      "Hey! Solo builder here. I built SignalPulse precisely for this problem — it monitors Reddit buyer keywords for $9/mo with zero enterprise bloat. Hope this helps!"
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const faqs = [
    {
      q: "How does the 7-Day Free Trial work?",
      a: "You get full, unrestricted access to all features (Reddit & X scanning, instant Telegram/Discord alerts, and AI pitch drafting) for 7 days with zero credit card required. After 7 days, you can choose to continue with our $9/month plan or grab the $39 Lifetime Deal.",
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
      q: "How does the $39 Lifetime Deal (LTD) work?",
      a: "You make a single one-time payment of $39 and receive a permanent Lifetime License code. You get unlimited access to all features with zero recurring monthly subscription fees forever.",
    },
  ];

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        theme === "dark"
          ? "dark bg-[#070a12] text-slate-100 dark-grid-pattern"
          : "light bg-[#f8fafc] text-slate-900 light-grid-pattern"
      } selection:bg-indigo-500/30 selection:text-indigo-200 relative`}
    >
      {/* Ambient Radial Beams & Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {theme === "dark" ? (
          <>
            <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-radial-glow blur-[100px]" />
            <div className="absolute top-1/3 -left-48 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[140px]" />
            <div className="absolute top-2/3 -right-48 w-[500px] h-[500px] bg-sky-600/10 rounded-full blur-[140px]" />
          </>
        ) : (
          <>
            <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px]" />
            <div className="absolute top-1/3 -left-48 w-[500px] h-[500px] bg-sky-400/10 rounded-full blur-[140px]" />
          </>
        )}
      </div>

      {/* Floating Glassmorphic Header (Radar v2.4 removed!) */}
      <header
        className={`sticky top-0 z-50 backdrop-blur-2xl border-b transition-colors ${
          theme === "dark"
            ? "bg-[#070a12]/80 border-white/[0.08]"
            : "bg-white/80 border-slate-200/80 shadow-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Clean Title (No 'Radar v2.4', No 'SaaS') */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-300">
              <Radar className="w-5 h-5 text-white animate-pulse" />
            </div>
            <span
              className={`text-xl font-extrabold tracking-tight ${
                theme === "dark" ? "text-white" : "text-slate-900"
              }`}
            >
              SignalPulse
            </span>
          </Link>

          {/* Navigation Links */}
          <nav
            className={`hidden md:flex items-center space-x-8 text-sm font-medium ${
              theme === "dark" ? "text-slate-300" : "text-slate-600"
            }`}
          >
            <a href="#how-it-works" className="hover:text-indigo-500 transition-colors">Workflow</a>
            <a href="#bento" className="hover:text-indigo-500 transition-colors">Features</a>
            <a href="#roi" className="hover:text-indigo-500 transition-colors">ROI Calculator</a>
            <a href="#comparison" className="hover:text-indigo-500 transition-colors">Compare</a>
            <a href="#pricing" className="hover:text-indigo-500 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-indigo-500 transition-colors">FAQ</a>
          </nav>

          {/* Actions: Theme Toggle + Auth Links */}
          <div className="flex items-center space-x-3">
            {/* Instant Dark / Light Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className={`p-2 rounded-xl border transition-all ${
                theme === "dark"
                  ? "bg-slate-900/80 border-slate-700 text-amber-400 hover:bg-slate-800"
                  : "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200"
              }`}
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <Link
              href="/login"
              className={`text-sm font-medium px-3 py-1.5 transition-colors ${
                theme === "dark"
                  ? "text-slate-300 hover:text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Sign In
            </Link>

            <Link
              href="/dashboard"
              className="relative inline-flex items-center justify-center p-[1px] overflow-hidden rounded-xl font-medium transition-all group"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl group-hover:opacity-100 transition-opacity" />
              <span
                className={`relative px-4 py-2 text-xs sm:text-sm font-bold rounded-[11px] transition-all duration-200 flex items-center gap-1.5 ${
                  theme === "dark"
                    ? "text-white bg-[#0a0f1d] group-hover:bg-opacity-80"
                    : "text-white bg-indigo-600 group-hover:bg-indigo-500"
                }`}
              >
                <span>Launch Radar</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-16 pb-20 md:pt-24 md:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Shimmer Pill Badge */}
        <div
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs sm:text-sm font-medium mb-8 shadow-xl ${
            theme === "dark"
              ? "shimmer-badge-dark border-indigo-500/40 text-indigo-200"
              : "shimmer-badge-light border-indigo-300 text-indigo-700"
          }`}
        >
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Stop paying \$100+/month for legacy enterprise monitors</span>
          <span
            className={`font-bold underline underline-offset-2 ml-1 ${
              theme === "dark" ? "text-white" : "text-indigo-950"
            }`}
          >
            Claim \$39 Lifetime Access &rarr;
          </span>
        </div>

        {/* Hero Title */}
        <h1
          className={`text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-5xl mx-auto leading-[1.12] ${
            theme === "dark" ? "text-white" : "text-slate-950"
          }`}
        >
          Turn Reddit & X Conversations Into{" "}
          <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Paying Customers
          </span>{" "}
          on Autopilot.
        </h1>

        {/* Hero Subtitle */}
        <p
          className={`mt-6 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed ${
            theme === "dark" ? "text-slate-400" : "text-slate-600"
          }`}
        >
          Monitor high-intent phrases like{" "}
          <span className="text-indigo-500 font-semibold">"looking for alternative to X"</span> or{" "}
          <span className="text-indigo-500 font-semibold">"recommend tool for Y"</span>. Get instant alerts on Telegram & Discord with ready-to-pitch AI replies in under 60 seconds.
        </p>

        {/* Hero CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all duration-200 flex items-center justify-center gap-2 group"
          >
            <span>Start 7-Day Free Trial</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/login"
            className={`w-full sm:w-auto px-8 py-4 rounded-xl border font-semibold text-base transition-all flex items-center justify-center gap-2 ${
              theme === "dark"
                ? "bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-slate-700/60"
                : "bg-white hover:bg-slate-50 text-slate-800 border-slate-300 shadow-sm"
            }`}
          >
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Try 1-Click Demo</span>
          </Link>
        </div>

        {/* Trust Points */}
        <div
          className={`mt-10 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm font-medium ${
            theme === "dark" ? "text-slate-400" : "text-slate-600"
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>7-Day Full Access Trial</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Zero \$0 API fees required</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Sub-60s Telegram & Discord push</span>
          </div>
        </div>

        {/* Live Interactive Simulator Card */}
        <div className="mt-14 max-w-4xl mx-auto rounded-3xl p-1 bg-gradient-to-b from-indigo-500/30 via-purple-500/15 to-transparent border border-indigo-500/20 shadow-2xl">
          <div
            className={`rounded-[22px] p-5 sm:p-7 text-left space-y-4 ${
              theme === "dark" ? "bg-[#0c1220]" : "bg-white border border-slate-200 shadow-xl"
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-rose-500" />
                <div className="h-3 w-3 rounded-full bg-amber-500" />
                <div className="h-3 w-3 rounded-full bg-emerald-500" />
                <span
                  className={`ml-2 text-xs font-mono font-medium ${
                    theme === "dark" ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Live Social Radar Simulator
                </span>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 font-bold">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Radar Listening
              </span>
            </div>

            {/* Keyword Input preview */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={demoKeyword}
                  onChange={(e) => setDemoKeyword(e.target.value)}
                  placeholder="e.g. alternative to notion"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-mono focus:outline-none focus:border-indigo-500 ${
                    theme === "dark"
                      ? "bg-slate-900 border-slate-700 text-white"
                      : "bg-slate-50 border-slate-300 text-slate-900"
                  }`}
                />
              </div>
              <button
                type="button"
                onClick={handleSimulate}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs sm:text-sm font-bold text-white transition-all flex items-center justify-center gap-2 whitespace-nowrap shadow-md shadow-indigo-600/30"
              >
                <Radar className="w-4 h-4" />
                <span>{simulatedMatch ? "Lead Detected & Dispatched!" : "Simulate Live Match"}</span>
              </button>
            </div>

            {/* Simulated Live Lead Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div
                className={`p-4 rounded-2xl border space-y-3 ${
                  theme === "dark"
                    ? "bg-slate-900/80 border-slate-800"
                    : "bg-slate-50 border-slate-200 shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-[#ff4500]/10 text-[#ff4500] border border-[#ff4500]/20">
                    <span className="font-bold">r/startups</span> • Reddit
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">14 seconds ago</span>
                </div>
                <h4
                  className={`text-sm font-bold leading-snug ${
                    theme === "dark" ? "text-white" : "text-slate-900"
                  }`}
                >
                  "Any affordable alternative to Brand24? $149/mo is way too steep for our launch stage."
                </h4>
                <p
                  className={`text-xs line-clamp-2 ${
                    theme === "dark" ? "text-slate-300" : "text-slate-600"
                  }`}
                >
                  "We just need to track 3 keywords on Reddit & Twitter and get notified on Telegram whenever someone asks for a tool. Recommendations?"
                </p>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-mono">u/IndieMaker_99</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                    🔥 High Intent (98%)
                  </span>
                </div>
              </div>

              {/* Instant Alert Ping */}
              <div
                className={`p-4 rounded-2xl border space-y-3 shadow-lg ${
                  theme === "dark"
                    ? "bg-gradient-to-br from-[#18233a] to-[#0f1626] border-indigo-500/30"
                    : "bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-[#229ed9]/15 text-[#229ed9] border border-[#229ed9]/30">
                    <Send className="w-3 h-3" /> Telegram Bot Ping
                  </span>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <Zap className="w-3 h-3" /> Delivered in 0.7s
                  </span>
                </div>
                <div
                  className={`text-xs font-mono p-2.5 rounded-xl border space-y-1 ${
                    theme === "dark"
                      ? "bg-black/40 border-white/5 text-slate-200"
                      : "bg-white border-indigo-100 text-slate-800 shadow-sm"
                  }`}
                >
                  <p className="text-indigo-500 font-bold">💡 1-Click AI Reply Ready:</p>
                  <p className="italic">
                    "Hey! Solo builder here. I built SignalPulse precisely for this problem — it monitors Reddit buyer keywords for $9/mo with zero enterprise bloat..."
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopySamplePitch}
                    className="flex-1 py-2 px-2 text-center text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copied to Clipboard!" : "Copy Reply & Open"}</span>
                  </button>
                  <Link
                    href="/login"
                    className={`py-2 px-3 text-center text-xs font-semibold rounded-xl border transition-colors ${
                      theme === "dark"
                        ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                        : "bg-white hover:bg-slate-100 text-slate-700 border-slate-300"
                    }`}
                  >
                    Test In App
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Features Section (21st.dev Style Architecture) */}
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
          <p className={`mt-3 text-sm sm:text-base ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
            Everything you need to turn casual social chatter into instant customers without spending hours manually searching.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bento Item 1 */}
          <div className="md:col-span-2 bento-card rounded-3xl p-8 space-y-5">
            <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <h4
              className={`text-2xl font-bold ${
                theme === "dark" ? "text-white" : "text-slate-900"
              }`}
            >
              Instant Push Alerts (Telegram & Discord)
            </h4>
            <p
              className={`text-sm leading-relaxed max-w-xl ${
                theme === "dark" ? "text-slate-400" : "text-slate-600"
              }`}
            >
              Why check a web dashboard every hour? SignalPulse routes leads straight to your Telegram bot or private Discord channel with direct link buttons. Pitch the buyer while the thread is still fresh.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="px-3 py-1 rounded-full border text-xs font-mono bg-slate-500/5 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-800">
                Telegram Bot API
              </span>
              <span className="px-3 py-1 rounded-full border text-xs font-mono bg-slate-500/5 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-800">
                Discord Webhooks
              </span>
              <span className="px-3 py-1 rounded-full border text-xs font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-semibold">
                Sub-60s Latency
              </span>
            </div>
          </div>

          {/* Bento Item 2 */}
          <div className="bento-card rounded-3xl p-8 space-y-5">
            <div className="h-12 w-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4
              className={`text-xl font-bold ${
                theme === "dark" ? "text-white" : "text-slate-900"
              }`}
            >
              1-Click AI Sales Pitch Drafter
            </h4>
            <p
              className={`text-sm leading-relaxed ${
                theme === "dark" ? "text-slate-400" : "text-slate-600"
              }`}
            >
              Don't sound like a corporate spammer. Our AI generates 3 customized, value-driven reply styles designed to pass strict community guidelines:
            </p>
            <div className="pt-1 text-xs text-indigo-500 font-mono font-semibold space-y-1">
              <p>• Helpful & Value-First (Advice focus)</p>
              <p>• Founder Story (Authentic solo maker)</p>
              <p>• Direct & Concise (Twitter-ready)</p>
            </div>
          </div>

          {/* Bento Item 3 */}
          <div className="bento-card rounded-3xl p-8 space-y-5">
            <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Filter className="w-6 h-6" />
            </div>
            <h4
              className={`text-xl font-bold ${
                theme === "dark" ? "text-white" : "text-slate-900"
              }`}
            >
              Anti-Spam Intent Classifier
            </h4>
            <p
              className={`text-sm leading-relaxed ${
                theme === "dark" ? "text-slate-400" : "text-slate-600"
              }`}
            >
              Automatically discards job offers, hiring notices, and cracked software queries. Scores each post as High, Medium, or Low intent before buzzing your phone.
            </p>
          </div>

          {/* Bento Item 4 */}
          <div className="md:col-span-2 bento-card rounded-3xl p-8 space-y-5">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4
              className={`text-2xl font-bold ${
                theme === "dark" ? "text-white" : "text-slate-900"
              }`}
            >
              Zero-Fee Reddit & X Scraping Engine
            </h4>
            <p
              className={`text-sm leading-relaxed max-w-xl ${
                theme === "dark" ? "text-slate-400" : "text-slate-600"
              }`}
            >
              Other platforms pass enormous API costs down to you. SignalPulse is engineered with resilient public search endpoints and rotating client signatures, keeping your operational costs at exactly $0.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="px-3 py-1 rounded-full border text-xs font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-bold">
                $0 API Overhead
              </span>
              <span className="px-3 py-1 rounded-full border text-xs font-mono bg-slate-500/5 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-800">
                Public JSON Search Streams
              </span>
              <span className="px-3 py-1 rounded-full border text-xs font-mono bg-slate-500/5 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-800">
                X (Twitter) Feed Adapter
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Interactive ROI Calculator Section */}
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
            <p className={`mt-2 text-sm ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
              See how many deals you need to close to 10x your SignalPulse investment.
            </p>
          </div>

          <div
            className={`p-6 sm:p-8 rounded-3xl border text-left space-y-6 ${
              theme === "dark"
                ? "bg-[#0d1322] border-indigo-500/30 shadow-2xl"
                : "bg-white border-slate-200 shadow-xl"
            }`}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label
                  className={`block text-xs font-semibold mb-2 ${
                    theme === "dark" ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  Your Product Price: <span className="text-indigo-500 font-bold">\${productPrice}</span>
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
                  className={`block text-xs font-semibold mb-2 ${
                    theme === "dark" ? "text-slate-300" : "text-slate-700"
                  }`}
                >
                  Monthly High-Intent Leads Pitched: <span className="text-indigo-500 font-bold">{monthlyLeadsEstimate} leads</span>
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
                  ? "bg-indigo-950/30 border-indigo-500/20"
                  : "bg-indigo-50/80 border-indigo-200"
              }`}
            >
              <div>
                <span className="text-xs font-semibold text-indigo-500 uppercase tracking-wide">
                  Projected Extra Monthly Revenue (at 25% Close Rate):
                </span>
                <div
                  className={`text-3xl sm:text-4xl font-extrabold mt-1 ${
                    theme === "dark" ? "text-emerald-400" : "text-emerald-600"
                  }`}
                >
                  + \${Math.round(productPrice * (monthlyLeadsEstimate * 0.25))} / month
                </div>
              </div>
              <Link
                href="/register"
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all whitespace-nowrap"
              >
                Start 7-Day Free Trial &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section (Brand24 vs Mention vs SignalPulse) */}
      <section id="comparison" className="relative z-10 py-20 border-y border-slate-200 dark:border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-500">The Market Disruption</h2>
          <h3
            className={`mt-2 text-3xl sm:text-4xl font-extrabold ${
              theme === "dark" ? "text-white" : "text-slate-950"
            }`}
          >
            Why Indie Makers Switch Away from \$100+/mo Tools
          </h3>
          <p className={`mt-3 max-w-2xl mx-auto text-sm sm:text-base ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
            Stop paying enterprise prices for complex sentiment charts you never look at. Get actionable buyer leads instead.
          </p>

          <div className="mt-12 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="py-4 px-4 text-sm font-semibold text-slate-500">Feature</th>
                  <th className="py-4 px-4 text-sm font-semibold text-slate-500">Brand24</th>
                  <th className="py-4 px-4 text-sm font-semibold text-slate-500">Mention</th>
                  <th
                    className={`py-4 px-4 text-sm font-bold text-indigo-500 rounded-t-2xl border-x border-t ${
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
                  <td className={`py-4 px-4 font-medium ${theme === "dark" ? "text-slate-200" : "text-slate-800"}`}>
                    Starting Price
                  </td>
                  <td className="py-4 px-4 text-rose-500 font-semibold">\$149 / month</td>
                  <td className="py-4 px-4 text-rose-500 font-semibold">\$99 / month</td>
                  <td
                    className={`py-4 px-4 font-bold border-x ${
                      theme === "dark"
                        ? "text-emerald-400 bg-indigo-950/40 border-indigo-500/30"
                        : "text-emerald-600 bg-indigo-50 border-indigo-200"
                    }`}
                  >
                    7-Day Free Trial, then \$9/mo or \$39 LTD
                  </td>
                </tr>
                <tr>
                  <td className={`py-4 px-4 font-medium ${theme === "dark" ? "text-slate-200" : "text-slate-800"}`}>
                    Reddit & X Target Focus
                  </td>
                  <td className="py-4 px-4 text-slate-400">Generic news & blogs</td>
                  <td className="py-4 px-4 text-slate-400">Broad crawler</td>
                  <td
                    className={`py-4 px-4 font-semibold border-x ${
                      theme === "dark"
                        ? "text-white bg-indigo-950/40 border-indigo-500/30"
                        : "text-slate-900 bg-indigo-50 border-indigo-200"
                    }`}
                  >
                    Direct buyer discussions
                  </td>
                </tr>
                <tr>
                  <td className={`py-4 px-4 font-medium ${theme === "dark" ? "text-slate-200" : "text-slate-800"}`}>
                    Instant Telegram & Discord
                  </td>
                  <td className="py-4 px-4 text-slate-400">Requires Zapier</td>
                  <td className="py-4 px-4 text-slate-400">Add-on cost</td>
                  <td
                    className={`py-4 px-4 font-semibold border-x ${
                      theme === "dark"
                        ? "text-emerald-400 bg-indigo-950/40 border-indigo-500/30"
                        : "text-emerald-600 bg-indigo-50 border-indigo-200"
                    }`}
                  >
                    Built-in 1-Click Setup
                  </td>
                </tr>
                <tr>
                  <td className={`py-4 px-4 font-medium ${theme === "dark" ? "text-slate-200" : "text-slate-800"}`}>
                    AI Sales Pitch Drafter
                  </td>
                  <td className="py-4 px-4"><XCircle className="w-5 h-5 text-rose-500 inline" /></td>
                  <td className="py-4 px-4"><XCircle className="w-5 h-5 text-rose-500 inline" /></td>
                  <td
                    className={`py-4 px-4 font-semibold border-x border-b rounded-b-2xl ${
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

      {/* Pricing Section (With 7-Day Free Trial!) */}
      <section id="pricing" className="relative z-10 py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-500">Sweet-Spot Pricing</h2>
        <h3
          className={`mt-2 text-3xl sm:text-5xl font-extrabold ${
            theme === "dark" ? "text-white" : "text-slate-950"
          }`}
        >
          Affordable Access for Solo Founders
        </h3>
        <p className={`mt-3 max-w-2xl mx-auto text-sm sm:text-base ${theme === "dark" ? "text-slate-400" : "text-slate-600"}`}>
          Start with our 7-day unrestricted trial, then pay once or subscribe with flat transparent pricing.
        </p>

        {/* Pricing Toggle */}
        <div
          className={`mt-8 inline-flex items-center p-1.5 rounded-2xl border ${
            theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-300 shadow-sm"
          }`}
        >
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all ${
              billingCycle === "monthly"
                ? "bg-indigo-600 text-white shadow-md"
                : theme === "dark"
                ? "text-slate-400 hover:text-white"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Monthly (\$9/mo)
          </button>
          <button
            onClick={() => setBillingCycle("ltd")}
            className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center gap-1.5 ${
              billingCycle === "ltd"
                ? "bg-indigo-600 text-white shadow-md"
                : theme === "dark"
                ? "text-slate-400 hover:text-white"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>Lifetime Deal (\$39 LTD)</span>
            <span className="text-[10px] bg-emerald-500 text-slate-950 font-extrabold px-2 py-0.5 rounded-full">
              BEST VALUE
            </span>
          </button>
        </div>

        {/* Pricing Cards (Updated with 7-Day Free Trial!) */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto text-left">
          {/* Card 1: 7-Day Free Trial */}
          <div className="bento-card rounded-3xl p-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                <Clock className="w-3.5 h-3.5" />
                <span>7-Day Free Trial</span>
              </div>
              <div>
                <h4 className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                  7-Day Full Access
                </h4>
                <p className={`text-xs mt-1 ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                  Full radar access for 7 days. No credit card required.
                </p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className={`text-4xl font-extrabold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                    \$0
                  </span>
                  <span className={`text-xs ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                    / for 7 days
                  </span>
                </div>
              </div>
              <ul className={`space-y-3 text-sm ${theme === "dark" ? "text-slate-300" : "text-slate-600"}`}>
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
                  <span>Upgrade anytime after 7 days</span>
                </li>
              </ul>
            </div>
            <Link
              href="/register"
              className={`w-full block text-center py-3.5 rounded-xl font-bold text-sm transition-colors border ${
                theme === "dark"
                  ? "bg-slate-800 hover:bg-slate-700 text-white border-slate-700"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-300"
              }`}
            >
              Start 7-Day Trial
            </Link>
          </div>

          {/* Card 2: Pro / LTD Founder Pass (Hero Tier) */}
          <div className="relative rounded-3xl p-8 bg-gradient-to-b from-[#18243e] to-[#0f172a] border-2 border-indigo-500 text-white shadow-2xl shadow-indigo-600/30 space-y-6 md:-translate-y-3 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500 text-white text-[11px] font-extrabold uppercase tracking-wide shadow-md">
                {billingCycle === "ltd" ? "Most Popular Founder Deal" : "Cancel Anytime"}
              </div>
              <div>
                <h4 className="text-xl font-extrabold text-white">
                  {billingCycle === "ltd" ? "Lifetime Founder Pass" : "Pro Monthly"}
                </h4>
                <p className="text-xs text-indigo-300 mt-1">
                  {billingCycle === "ltd" ? "Pay once, monitor leads forever" : "Flexible monthly subscription"}
                </p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-5xl font-extrabold text-white">
                    {billingCycle === "ltd" ? "\$39" : "\$9"}
                  </span>
                  <span className="text-xs text-slate-300 font-medium">
                    {billingCycle === "ltd" ? "one-time payment" : "/ month"}
                  </span>
                </div>
              </div>
              <ul className="space-y-3 text-sm text-slate-200">
                <li className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Unlimited active keywords tracked</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Reddit & X (Twitter) real-time scanning</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Instant Telegram Bot & Discord Webhooks</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>1-Click AI Sales Pitch Drafter</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>High-Intent Lead Filter (No spam/jobs)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Zero ongoing API fees</span>
                </li>
              </ul>
            </div>
            <Link
              href="/login"
              className="w-full block text-center py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/40 transition-colors"
            >
              {billingCycle === "ltd" ? "Claim \$39 Lifetime Access" : "Subscribe for \$9/Month"}
            </Link>
          </div>

          {/* Card 3: Agency & Power Pass */}
          <div className="bento-card rounded-3xl p-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-500 border border-purple-500/20">
                <span>Power Users</span>
              </div>
              <div>
                <h4 className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                  Agency & Teams
                </h4>
                <p className={`text-xs mt-1 ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                  For freelancers managing multiple client brands
                </p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className={`text-4xl font-extrabold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
                    \$79
                  </span>
                  <span className={`text-xs ${theme === "dark" ? "text-slate-400" : "text-slate-500"}`}>
                    / lifetime
                  </span>
                </div>
              </div>
              <ul className={`space-y-3 text-sm ${theme === "dark" ? "text-slate-300" : "text-slate-600"}`}>
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
              className={`w-full block text-center py-3.5 rounded-xl font-bold text-sm transition-colors border ${
                theme === "dark"
                  ? "bg-slate-800 hover:bg-slate-700 text-white border-slate-700"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-300"
              }`}
            >
              Get Agency Pass
            </Link>
          </div>
        </div>
      </section>

      {/* Accordion FAQ Section */}
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
                <h4 className="font-bold text-base">{faq.q}</h4>
                <ChevronDown
                  className={`w-5 h-5 transition-transform duration-200 ${
                    activeFaq === idx ? "rotate-180 text-indigo-500" : "text-slate-400"
                  }`}
                />
              </div>
              {activeFaq === idx && (
                <div
                  className={`px-6 pb-6 text-sm leading-relaxed border-t pt-4 ${
                    theme === "dark"
                      ? "text-slate-400 border-white/5"
                      : "text-slate-600 border-slate-200"
                  }`}
                >
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer
        className={`relative z-10 border-t py-12 text-center text-xs ${
          theme === "dark"
            ? "border-white/[0.08] text-slate-500"
            : "border-slate-200 text-slate-500 bg-white"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Radar className="w-4 h-4 text-indigo-500" />
            <span className={`font-bold ${theme === "dark" ? "text-slate-300" : "text-slate-800"}`}>
              SignalPulse
            </span>
            <span>© 2026. Built for Indie Makers & Founders.</span>
          </div>
          <div className="flex space-x-6">
            <Link href="/login" className="hover:text-indigo-500 transition-colors">Dashboard</Link>
            <a href="#pricing" className="hover:text-indigo-500 transition-colors">Pricing</a>
            <a href="#comparison" className="hover:text-indigo-500 transition-colors">Compare</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
