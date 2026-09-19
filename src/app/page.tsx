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
  DollarSign,
  Search,
} from "lucide-react";

export default function LandingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "ltd">("ltd");
  const [demoKeyword, setDemoKeyword] = useState("alternative to notion");

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Background glow effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-600/15 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 -left-40 w-[600px] h-[500px] bg-violet-600/10 rounded-full blur-[140px]" />
        <div className="absolute top-2/3 -right-40 w-[600px] h-[500px] bg-sky-600/10 rounded-full blur-[140px]" />
      </div>

      {/* Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#070b14]/80 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Radar className="w-5 h-5 text-white animate-pulse" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
              SignalPulse
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                SaaS
              </span>
            </span>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#comparison" className="hover:text-white transition-colors">Compare</a>
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
              className="relative group overflow-hidden rounded-xl p-[1px] focus:outline-none"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl transition-all duration-300 group-hover:scale-105" />
              <span className="relative block px-4 py-2 text-sm font-semibold text-white bg-slate-950 rounded-[11px] group-hover:bg-opacity-80 transition-all duration-200">
                Launch Dashboard &rarr;
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-24 md:pt-28 md:pb-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Deal Alert Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-indigo-950/80 to-purple-950/80 border border-indigo-500/30 text-indigo-300 text-xs sm:text-sm font-medium mb-8 shadow-inner">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Stop paying \$100+/mo for Brand24 or Mention</span>
          <span className="text-white font-semibold underline underline-offset-2 ml-1">
            Grab our \$39 Lifetime Deal &rarr;
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.12]">
          Turn Reddit & X Conversations Into{" "}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
            Paying Customers
          </span>{" "}
          on Autopilot.
        </h1>

        {/* Subheading */}
        <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
          Monitor 3–5 high-intent buyer phrases like <span className="text-indigo-300 font-medium">"looking for alternative to X"</span> or <span className="text-indigo-300 font-medium">"best tool for Y"</span>. Get instant alerts on Telegram & Discord with ready-to-pitch AI replies in under 60 seconds.
        </p>

        {/* CTA Buttons */}
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
            <span>Try 1-Click Demo</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </Link>
        </div>

        {/* Trust Badges */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Zero \$0 API fee required</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Instant Telegram & Discord pings</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>1-Click AI sales pitch drafting</span>
          </div>
        </div>

        {/* Live Interactive Simulator Preview */}
        <div className="mt-16 max-w-4xl mx-auto rounded-2xl p-1 bg-gradient-to-b from-indigo-500/20 via-purple-500/10 to-transparent border border-white/10 shadow-2xl shadow-indigo-950/40">
          <div className="rounded-[15px] bg-[#0c1322] p-4 sm:p-6 text-left">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-xs font-mono text-slate-400">Live Detection Simulator</span>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Radar Listening
              </span>
            </div>

            {/* Keyword Input preview */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={demoKeyword}
                  onChange={(e) => setDemoKeyword(e.target.value)}
                  placeholder="e.g. alternative to notion"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <button
                type="button"
                className="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs sm:text-sm font-semibold text-white transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
              >
                <Radar className="w-4 h-4" />
                Simulate Radar Match
              </button>
            </div>

            {/* Mock Incoming Lead */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Reddit Card */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-[#ff4500]/10 text-[#ff4500] border border-[#ff4500]/20">
                    <span className="font-bold">r/SaaS</span> • Reddit
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">14 seconds ago</span>
                </div>
                <h4 className="text-sm font-bold text-white leading-snug">
                  "Is there a cleaner, cheaper alternative to Notion or Brand24? Overwhelmed by bloat."
                </h4>
                <p className="text-xs text-slate-300 line-clamp-2">
                  "We have a 4 person team and we're looking for something that just does the job fast without charging us \$120 every single month..."
                </p>
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">u/Growth_Founder</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-medium">🔥 High Intent (96%)</span>
                </div>
              </div>

              {/* Instant Telegram / Discord Ping Alert */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-[#1b253b] to-[#121929] border border-indigo-500/30 space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-[#229ed9]/20 text-[#229ed9] border border-[#229ed9]/30">
                    <Send className="w-3 h-3" /> Telegram Bot Alert
                  </span>
                  <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                    <Zap className="w-3 h-3" /> Sent in 0.8s
                  </span>
                </div>
                <div className="text-xs text-slate-300 font-mono bg-black/40 p-2.5 rounded-lg border border-white/5 space-y-1">
                  <p className="text-indigo-300 font-bold">💡 1-Click AI Pitch Ready:</p>
                  <p className="italic text-slate-300">
                    "Hey! Solo maker here. We built SignalPulse precisely to solve this. It monitors your keywords with zero bloat for \$9/mo..."
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 py-1.5 px-2 text-center text-xs font-semibold rounded-md bg-indigo-600 hover:bg-indigo-500 text-white transition-colors">
                    Copy Pitch & Open
                  </button>
                  <button className="py-1.5 px-2 text-center text-xs font-medium rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors">
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section (Brand24 vs Mention vs SignalPulse) */}
      <section id="comparison" className="relative z-10 py-20 bg-[#0a101d] border-y border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400">The Market Disruption</h2>
          <h3 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white">
            Why Indie Hackers Are Ditching \$100/mo Tools
          </h3>
          <p className="mt-3 text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
            Enterprise tools charge you for complex sentiment sentiment charts you never open. SignalPulse focuses strictly on getting you paying buyer leads.
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
                  <td className="py-4 px-4 font-medium text-slate-200">Starting Price</td>
                  <td className="py-4 px-4 text-rose-400 font-semibold">\$149 / month</td>
                  <td className="py-4 px-4 text-rose-400 font-semibold">\$99 / month</td>
                  <td className="py-4 px-4 text-emerald-400 font-bold bg-indigo-950/40 border-x border-indigo-500/30">
                    \$9/mo or \$39 Lifetime Deal
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-medium text-slate-200">Target Audience</td>
                  <td className="py-4 px-4 text-slate-400">Fortune 500 Agencies</td>
                  <td className="py-4 px-4 text-slate-400">Mid-Market PR Teams</td>
                  <td className="py-4 px-4 text-indigo-200 font-medium bg-indigo-950/40 border-x border-indigo-500/30">
                    Indie Hackers & Freelancers
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-medium text-slate-200">Reddit & X Focus</td>
                  <td className="py-4 px-4 text-slate-400">Generic news & blogs</td>
                  <td className="py-4 px-4 text-slate-400">Broad web crawler</td>
                  <td className="py-4 px-4 text-white font-medium bg-indigo-950/40 border-x border-indigo-500/30">
                    Direct buyer discussions
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-medium text-slate-200">Instant Telegram & Discord</td>
                  <td className="py-4 px-4 text-slate-500">Requires complex zapier</td>
                  <td className="py-4 px-4 text-slate-500">Add-on cost</td>
                  <td className="py-4 px-4 text-emerald-400 font-medium bg-indigo-950/40 border-x border-indigo-500/30">
                    Built-in 1-Click Webhooks
                  </td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-medium text-slate-200">AI Pitch Drafter</td>
                  <td className="py-4 px-4"><XCircle className="w-5 h-5 text-rose-500 inline" /></td>
                  <td className="py-4 px-4"><XCircle className="w-5 h-5 text-rose-500 inline" /></td>
                  <td className="py-4 px-4 text-emerald-400 font-medium bg-indigo-950/40 border-x border-b border-indigo-500/30 rounded-b-xl">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 inline" /> Context-Aware Replies
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="relative z-10 py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400">Simple 3-Step Flow</h2>
          <h3 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white">
            From Social Post to Closed Deal in 60 Seconds
          </h3>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-[#0e1627] border border-white/5 hover:border-indigo-500/30 transition-colors space-y-4">
            <div className="h-12 w-12 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center font-bold text-lg">
              1
            </div>
            <h4 className="text-xl font-bold text-white">Enter Your Target Phrases</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Add phrases your ideal customers type when searching for alternatives, like <em>"looking for tool for X"</em> or <em>"tired of competitor Y"</em>.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-[#0e1627] border border-white/5 hover:border-indigo-500/30 transition-colors space-y-4">
            <div className="h-12 w-12 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center font-bold text-lg">
              2
            </div>
            <h4 className="text-xl font-bold text-white">Get Real-Time Ping</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              SignalPulse scans Reddit & X round the clock. Within seconds of a post going live, your Telegram bot or Discord channel pings you with a direct link.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-[#0e1627] border border-white/5 hover:border-indigo-500/30 transition-colors space-y-4">
            <div className="h-12 w-12 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20 flex items-center justify-center font-bold text-lg">
              3
            </div>
            <h4 className="text-xl font-bold text-white">Send 1-Click Value Pitch</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Hit "Copy AI Pitch" to get an authentic, non-spammy reply customized to the user's specific problem. Paste it, answer questions, and secure a customer.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 py-24 bg-[#090e1b] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400">Sweet-Spot Pricing</h2>
          <h3 className="mt-2 text-3xl sm:text-5xl font-extrabold text-white">
            Unbeatable Pricing for Solo Founders
          </h3>
          <p className="mt-3 text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
            Never let high enterprise pricing hold you back from finding your first 100 paying customers.
          </p>

          {/* Pricing Toggle */}
          <div className="mt-8 inline-flex items-center p-1.5 rounded-xl bg-slate-900 border border-slate-800">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                billingCycle === "monthly"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Monthly Subscription (\$9/mo)
            </button>
            <button
              onClick={() => setBillingCycle("ltd")}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                billingCycle === "ltd"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>Lifetime Deal (\$39 LTD)</span>
              <span className="text-[10px] bg-emerald-500 text-slate-950 font-bold px-1.5 py-0.2 rounded-full">
                BEST VALUE
              </span>
            </button>
          </div>

          {/* Pricing Cards */}
          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto text-left">
            {/* Free Starter */}
            <div className="p-8 rounded-2xl bg-[#0c1322] border border-white/5 space-y-6">
              <div>
                <h4 className="text-lg font-bold text-white">Free Starter</h4>
                <p className="text-xs text-slate-400 mt-1">To test the waters on Reddit</p>
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
                Try Free Account
              </Link>
            </div>

            {/* Monthly Pro or Lifetime Deal (Hero Tier) */}
            <div className="relative p-8 rounded-2xl bg-gradient-to-b from-[#17223b] to-[#0f172a] border-2 border-indigo-500/80 shadow-2xl shadow-indigo-600/20 space-y-6 md:-translate-y-2">
              <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-indigo-500 text-white text-[11px] font-bold tracking-wide uppercase shadow-md">
                {billingCycle === "ltd" ? "Most Popular Deal" : "Cancel Anytime"}
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">
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
                  <span className="text-xs text-slate-300">
                    {billingCycle === "ltd" ? "one-time payment" : "/ month"}
                  </span>
                </div>
              </div>
              <ul className="space-y-3 text-sm text-slate-200">
                <li className="flex items-center gap-2 font-medium">
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
                {billingCycle === "ltd" ? "Grab \$39 Lifetime Deal Now" : "Subscribe for \$9/Month"}
              </Link>
            </div>

            {/* Agency / Power */}
            <div className="p-8 rounded-2xl bg-[#0c1322] border border-white/5 space-y-6">
              <div>
                <h4 className="text-lg font-bold text-white">Agency & Team</h4>
                <p className="text-xs text-slate-400 mt-1">For freelancers managing multiple client SaaS</p>
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
                  <span>Priority ingestion worker</span>
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
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="relative z-10 py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h3 className="text-3xl font-extrabold text-white text-center mb-12">Frequently Asked Questions</h3>
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-[#0c1322] border border-white/5 space-y-2">
            <h4 className="font-bold text-white">Do I need to pay for Reddit or Twitter API access?</h4>
            <p className="text-sm text-slate-400">
              No! SignalPulse is engineered with built-in public JSON search ingestion for Reddit requiring zero API fees. For Twitter/X, it uses lightweight syndication search or allows you to optionally add your own bearer token.
            </p>
          </div>
          <div className="p-6 rounded-xl bg-[#0c1322] border border-white/5 space-y-2">
            <h4 className="font-bold text-white">How does the Telegram & Discord notification work?</h4>
            <p className="text-sm text-slate-400">
              You can connect a Telegram bot in under 2 minutes by entering your Bot Token and Chat ID. For Discord, simply paste your webhook URL. Whenever a match is found, you receive an instant push notification on your phone.
            </p>
          </div>
          <div className="p-6 rounded-xl bg-[#0c1322] border border-white/5 space-y-2">
            <h4 className="font-bold text-white">Will Reddit ban my account for replying?</h4>
            <p className="text-sm text-slate-400">
              No, because SignalPulse doesn't use spam bots to reply automatically. It alerts <em>you</em> and crafts a thoughtful, high-value AI reply draft that you can review and post organically with your personal account.
            </p>
          </div>
          <div className="p-6 rounded-xl bg-[#0c1322] border border-white/5 space-y-2">
            <h4 className="font-bold text-white">How does the \$39 Lifetime Deal work?</h4>
            <p className="text-sm text-slate-400">
              You make a single one-time payment of \$39 and receive a Lifetime License code. You get unlimited access to all Pro features with zero recurring monthly charges.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Radar className="w-4 h-4 text-indigo-400" />
            <span className="font-bold text-slate-300">SignalPulse SaaS</span>
            <span>© 2026. Built for Indie Makers.</span>
          </div>
          <div className="flex space-x-6">
            <Link href="/login" className="hover:text-slate-300">Dashboard</Link>
            <a href="#pricing" className="hover:text-slate-300">Pricing</a>
            <a href="#comparison" className="hover:text-slate-300">Compare</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
