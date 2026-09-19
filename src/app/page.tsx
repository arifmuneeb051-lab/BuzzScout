"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Radar,
  Zap,
  Bell,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  XCircle,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Send,
  ExternalLink,
  Search,
  Filter,
  Check,
  ChevronDown,
  Cpu,
  Layers,
  Activity,
  Flame,
} from "lucide-react";

export default function LandingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "ltd">("ltd");
  const [demoKeyword, setDemoKeyword] = useState("alternative to notion");
  const [simulatedMatch, setSimulatedMatch] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const handleSimulate = () => {
    setSimulatedMatch(true);
    setTimeout(() => setSimulatedMatch(false), 3000);
  };

  const faqs = [
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
    <div className="min-h-screen bg-[#070a12] text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200 bg-grid-pattern relative">
      {/* 21st.dev Radial Beam & Ambient Glow Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-radial-glow blur-[100px]" />
        <div className="absolute top-1/3 -left-48 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[140px]" />
        <div className="absolute top-2/3 -right-48 w-[500px] h-[500px] bg-sky-600/10 rounded-full blur-[140px]" />
      </div>

      {/* Floating Glassmorphic Header (Inspired by 21st.dev Navigation) */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-[#070a12]/80 border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-300">
              <Radar className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-white">
                SignalPulse
              </span>
              {/* Version & status pill */}
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 uppercase tracking-wide">
                Radar v2.4
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
            <a href="#how-it-works" className="hover:text-white transition-colors">Workflow</a>
            <a href="#bento" className="hover:text-white transition-colors">Features</a>
            <a href="#comparison" className="hover:text-white transition-colors">Disruption</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center space-x-4">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-3 py-1.5"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="relative inline-flex items-center justify-center p-[1px] overflow-hidden rounded-xl font-medium transition-all group"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl group-hover:opacity-100 transition-opacity" />
              <span className="relative px-4 py-2 text-xs sm:text-sm font-bold text-white bg-[#0a0f1d] rounded-[11px] group-hover:bg-opacity-80 transition-all duration-200 flex items-center gap-1.5">
                <span>Launch Radar</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-24 md:pt-28 md:pb-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Shimmer Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full shimmer-badge border border-indigo-500/40 text-indigo-200 text-xs sm:text-sm font-medium mb-8 shadow-xl">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Stop paying \$100+/month for legacy enterprise monitors</span>
          <span className="text-white font-bold underline underline-offset-2 ml-1">
            Claim \$39 Lifetime Access &rarr;
          </span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.12]">
          Turn Reddit & X Conversations Into{" "}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
            Paying Customers
          </span>{" "}
          on Autopilot.
        </h1>

        {/* Hero Subtitle */}
        <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
          Monitor 3–5 high-intent phrases like <span className="text-indigo-300 font-semibold">"looking for alternative to X"</span> or <span className="text-indigo-300 font-semibold">"recommend tool for Y"</span>. Get instant alerts on Telegram & Discord with ready-to-pitch AI replies in under 60 seconds.
        </p>

        {/* Hero CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#pricing"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all duration-200 flex items-center justify-center gap-2 group"
          >
            <span>Get Lifetime Deal for \$39</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/60 font-semibold text-base transition-all flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Try 1-Click Demo</span>
          </Link>
        </div>

        {/* Trust Badges */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm text-slate-400 font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Zero \$0 API fee required</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Sub-60s Telegram & Discord delivery</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>1-Click non-spammy AI sales pitches</span>
          </div>
        </div>

        {/* Live Interactive Simulator (21st.dev Component Structure) */}
        <div className="mt-16 max-w-4xl mx-auto rounded-2xl p-1 bg-gradient-to-b from-indigo-500/25 via-purple-500/10 to-transparent border border-white/10 shadow-2xl">
          <div className="rounded-[15px] bg-[#0c1220] p-4 sm:p-6 text-left space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-xs font-mono text-slate-400">Live Intent Detection Engine</span>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Radar Online
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
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
              <button
                type="button"
                onClick={handleSimulate}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs sm:text-sm font-bold text-white transition-all flex items-center justify-center gap-2 whitespace-nowrap shadow-md shadow-indigo-600/30"
              >
                <Radar className="w-4 h-4" />
                <span>{simulatedMatch ? "Matched & Alerted!" : "Simulate Live Match"}</span>
              </button>
            </div>

            {/* Simulated Live Lead Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-[#ff4500]/10 text-[#ff4500] border border-[#ff4500]/20">
                    <span className="font-bold">r/startups</span> • Reddit
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">12 seconds ago</span>
                </div>
                <h4 className="text-sm font-bold text-white leading-snug">
                  "Any affordable alternative to Brand24? $149/mo is way too steep for our launch stage."
                </h4>
                <p className="text-xs text-slate-300 line-clamp-2">
                  "We just need to track 3 keywords on Reddit & Twitter and get notified on Discord whenever someone asks for a tool. Help appreciated!"
                </p>
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono">u/IndieMaker_99</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold">🔥 High Intent (98%)</span>
                </div>
              </div>

              {/* Instant Alert Ping */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-[#18233a] to-[#0f1626] border border-indigo-500/30 space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-[#229ed9]/20 text-[#229ed9] border border-[#229ed9]/30">
                    <Send className="w-3 h-3" /> Telegram Bot Ping
                  </span>
                  <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                    <Zap className="w-3 h-3" /> Delivered in 0.7s
                  </span>
                </div>
                <div className="text-xs text-slate-200 font-mono bg-black/40 p-2.5 rounded-lg border border-white/5 space-y-1">
                  <p className="text-indigo-300 font-bold">💡 1-Click AI Reply Ready:</p>
                  <p className="italic text-slate-300">
                    "Hey! Solo builder here. I built SignalPulse precisely for this problem — monitors Reddit keywords for \$9/mo with zero bloat..."
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 py-1.5 px-2 text-center text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors">
                    Copy Reply & Open Thread
                  </button>
                  <button className="py-1.5 px-2 text-center text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors">
                    Save Lead
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Features Section (21st.dev Style Component Architecture) */}
      <section id="bento" className="relative z-10 py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400">Next-Gen Architecture</h2>
          <h3 className="mt-2 text-3xl sm:text-5xl font-extrabold text-white">
            Built from the Ground Up to Convert
          </h3>
          <p className="mt-3 text-slate-400 text-sm sm:text-base">
            Everything you need to turn casual social chatter into instant customers without spending hours manually searching.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bento Item 1 (Wide) */}
          <div className="md:col-span-2 bento-card rounded-3xl p-8 space-y-5">
            <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <h4 className="text-2xl font-bold text-white">
              Instant Push Alerts (Telegram & Discord)
            </h4>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xl">
              Why check a web dashboard every hour? SignalPulse routes leads straight to your Telegram bot or private Discord channel with direct link buttons. Pitch the buyer while the thread is still fresh.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
                Telegram Bot API
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
                Discord Webhooks
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-400">
                Sub-60s Latency
              </span>
            </div>
          </div>

          {/* Bento Item 2 */}
          <div className="bento-card rounded-3xl p-8 space-y-5">
            <div className="h-12 w-12 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-bold text-white">
              1-Click AI Sales Pitch Drafter
            </h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Don't sound like a corporate spammer. Our AI generates 3 customized, value-driven reply styles designed to pass strict Reddit community guidelines.
            </p>
            <div className="pt-2 text-xs text-indigo-300 font-mono">
              • Helpful & Value-First<br />
              • Founder Story<br />
              • Direct & Concise
            </div>
          </div>

          {/* Bento Item 3 */}
          <div className="bento-card rounded-3xl p-8 space-y-5">
            <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <Filter className="w-6 h-6" />
            </div>
            <h4 className="text-xl font-bold text-white">
              Anti-Spam Intent Classifier
            </h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Discards job offers, hiring notices, and cracked software queries. Scores each post as High, Medium, or Low intent before sending an alert.
            </p>
          </div>

          {/* Bento Item 4 (Wide) */}
          <div className="md:col-span-2 bento-card rounded-3xl p-8 space-y-5">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="text-2xl font-bold text-white">
              Zero-Fee Reddit & X Scraping Engine
            </h4>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xl">
              Other platforms pass huge API costs down to you. SignalPulse is engineered with resilient public search endpoints and rotating client signatures, keeping your operational costs at exactly $0.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-400">
                $0 API Overhead
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
                Reddit Search Streams
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
                X (Twitter) Feed Adapter
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Matrix Section */}
      <section id="comparison" className="relative z-10 py-20 bg-[#090e1b] border-y border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400">The Pricing Disruption</h2>
          <h3 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white">
            Why Indie Makers Are Switching Away from $100+/mo Tools
          </h3>
          <p className="mt-3 text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
            Stop paying enterprise prices for complex sentiment charts you never look at. Get actionable buyer leads instead.
          </p>

          <div className="mt-12 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="py-4 px-4 text-sm font-semibold text-slate-400">Feature</th>
                  <th className="py-4 px-4 text-sm font-semibold text-slate-400">Brand24</th>
                  <th className="py-4 px-4 text-sm font-semibold text-slate-400">Mention</th>
                  <th className="py-4 px-4 text-sm font-bold text-indigo-400 bg-indigo-950/40 rounded-t-xl border-x border-t border-indigo-500/30">
                    SignalPulse (Us)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                <tr>
                  <td className="py-4 px-4 font-medium text-slate-200">Pricing</td>
                  <td className="py-4 px-4 text-rose-400 font-semibold">\$149 / month</td>
                  <td className="py-4 px-4 text-rose-400 font-semibold">\$99 / month</td>
                  <td className="py-4 px-4 text-emerald-400 font-bold bg-indigo-950/40 border-x border-indigo-500/30">
                    \$9/mo or \$39 Lifetime Deal
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-medium text-slate-200">Reddit & X Target Focus</td>
                  <td className="py-4 px-4 text-slate-400">Generic news & blogs</td>
                  <td className="py-4 px-4 text-slate-400">Broad web crawler</td>
                  <td className="py-4 px-4 text-white font-semibold bg-indigo-950/40 border-x border-indigo-500/30">
                    Direct buyer discussions
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-medium text-slate-200">Instant Telegram & Discord</td>
                  <td className="py-4 px-4 text-slate-500">Requires complex zapier</td>
                  <td className="py-4 px-4 text-slate-500">Extra fee</td>
                  <td className="py-4 px-4 text-emerald-400 font-semibold bg-indigo-950/40 border-x border-indigo-500/30">
                    Built-in 1-Click Setup
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-medium text-slate-200">AI Pitch Drafter</td>
                  <td className="py-4 px-4"><XCircle className="w-5 h-5 text-rose-500 inline" /></td>
                  <td className="py-4 px-4"><XCircle className="w-5 h-5 text-rose-500 inline" /></td>
                  <td className="py-4 px-4 text-emerald-400 font-semibold bg-indigo-950/40 border-x border-b border-indigo-500/30 rounded-b-xl">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 inline" /> Context-Aware Replies
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400">Sweet-Spot Pricing</h2>
        <h3 className="mt-2 text-3xl sm:text-5xl font-extrabold text-white">
          Affordable Access for Solo Founders
        </h3>
        <p className="mt-3 text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
          Never let enterprise fees hold you back from finding your next 100 paying customers.
        </p>

        {/* Pricing Toggle */}
        <div className="mt-8 inline-flex items-center p-1.5 rounded-2xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all ${
              billingCycle === "monthly"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Monthly (\$9/mo)
          </button>
          <button
            onClick={() => setBillingCycle("ltd")}
            className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all flex items-center gap-1.5 ${
              billingCycle === "ltd"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span>Lifetime Deal (\$39 LTD)</span>
            <span className="text-[10px] bg-emerald-500 text-slate-950 font-extrabold px-2 py-0.5 rounded-full">
              BEST VALUE
            </span>
          </button>
        </div>

        {/* Pricing Cards */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto text-left">
          {/* Free Starter */}
          <div className="bento-card rounded-3xl p-8 space-y-6">
            <div>
              <h4 className="text-lg font-bold text-white">Free Starter</h4>
              <p className="text-xs text-slate-400 mt-1">For testing social listening</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white">\$0</span>
                <span className="text-xs text-slate-400">/ forever</span>
              </div>
            </div>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>1 active keyword tracked</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Reddit monitoring</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Up to 15 leads / month</span>
              </li>
              <li className="flex items-center gap-2 text-slate-500">
                <XCircle className="w-4 h-4 text-slate-600" />
                <span>No Telegram / Discord alerts</span>
              </li>
            </ul>
            <Link
              href="/login"
              className="w-full block text-center py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold transition-colors"
            >
              Start Free
            </Link>
          </div>

          {/* Pro / LTD Pass (Hero Tier) */}
          <div className="relative rounded-3xl p-8 bg-gradient-to-b from-[#18243e] to-[#0f172a] border-2 border-indigo-500/80 shadow-2xl shadow-indigo-600/25 space-y-6 md:-translate-y-2">
            <div className="absolute -top-3.5 right-6 px-3.5 py-1 rounded-full bg-indigo-500 text-white text-[11px] font-extrabold tracking-wide uppercase shadow-md">
              {billingCycle === "ltd" ? "Most Popular Deal" : "Cancel Anytime"}
            </div>
            <div>
              <h4 className="text-xl font-extrabold text-white">
                {billingCycle === "ltd" ? "Lifetime Founder Pass" : "Pro Monthly"}
              </h4>
              <p className="text-xs text-indigo-300 mt-1">
                {billingCycle === "ltd"
                  ? "Pay once, monitor leads forever"
                  : "Flexible monthly subscription"}
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
            <Link
              href="/login"
              className="w-full block text-center py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/40 transition-colors"
            >
              {billingCycle === "ltd" ? "Claim \$39 Lifetime Access" : "Subscribe for \$9/Month"}
            </Link>
          </div>

          {/* Agency & Power Pass */}
          <div className="bento-card rounded-3xl p-8 space-y-6">
            <div>
              <h4 className="text-lg font-bold text-white">Agency & Power</h4>
              <p className="text-xs text-slate-400 mt-1">For freelancers managing multiple client brands</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white">\$79</span>
                <span className="text-xs text-slate-400">/ lifetime</span>
              </div>
            </div>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Everything in Lifetime Pass</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Multiple client brand profiles</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Multiple Telegram & Discord routing</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Priority ingestion frequency</span>
              </li>
            </ul>
            <Link
              href="/login"
              className="w-full block text-center py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold transition-colors"
            >
              Get Agency Pass
            </Link>
          </div>
        </div>
      </section>

      {/* Accordion FAQ Section */}
      <section id="faq" className="relative z-10 py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h3 className="text-3xl font-extrabold text-white text-center mb-12">Frequently Asked Questions</h3>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bento-card rounded-2xl overflow-hidden cursor-pointer"
              onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
            >
              <div className="p-6 flex items-center justify-between">
                <h4 className="font-bold text-white text-base">{faq.q}</h4>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${
                    activeFaq === idx ? "rotate-180 text-indigo-400" : ""
                  }`}
                />
              </div>
              {activeFaq === idx && (
                <div className="px-6 pb-6 text-sm text-slate-400 leading-relaxed border-t border-white/5 pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Premium Footer */}
      <footer className="relative z-10 border-t border-white/[0.08] py-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Radar className="w-4 h-4 text-indigo-400" />
            <span className="font-bold text-slate-300">SignalPulse</span>
            <span>© 2026. Built for Indie Makers & Founders.</span>
          </div>
          <div className="flex space-x-6">
            <Link href="/login" className="hover:text-slate-300 transition-colors">Dashboard</Link>
            <a href="#pricing" className="hover:text-slate-300 transition-colors">Pricing</a>
            <a href="#comparison" className="hover:text-slate-300 transition-colors">Compare</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
