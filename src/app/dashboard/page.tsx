"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Flame,
  Tag,
  Bell,
  ArrowUpRight,
  TrendingUp,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Send,
  MessageCircle,
  Radar,
  ShieldCheck,
  ShieldAlert,
  Lock,
} from "lucide-react";

interface OverviewData {
  stats: {
    totalLeads: number;
    highIntentCount: number;
    activeKeywords: number;
    connectedChannels: number;
  };
  recentLeads: Array<{
    id: string;
    title: string;
    content: string;
    author: string;
    platform: string;
    intentScore: string;
    status: string;
    url: string;
    sourceSubreddit?: string;
    detectedAt: string;
    keyword: { phrase: string };
  }>;
}

export default function DashboardOverview() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState<{
    id?: string;
    name?: string;
    email?: string;
    avatarUrl?: string | null;
    googleId?: string | null;
    productName?: string | null;
    productUrl?: string | null;
    plan?: string;
    planStatus?: string;
    role?: string;
    createdAt?: string;
  } | null>(null);

  // Telegram Integration State
  const [telegramChannel, setTelegramChannel] = useState<{ id?: string; telegramBotToken?: string; telegramChatId?: string; active?: boolean } | null>(null);
  const [tgBotTokenInput, setTgBotTokenInput] = useState("");
  const [tgChatIdInput, setTgChatIdInput] = useState("");
  const [tgBotUrl, setTgBotUrl] = useState("https://t.me/BotFather");
  const [tgConnecting, setTgConnecting] = useState(false);
  const [tgTesting, setTgTesting] = useState(false);
  const [tgMessage, setTgMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchOverview = async () => {
    try {
      const [leadsRes, kwRes, chRes, meRes] = await Promise.all([
        fetch("/api/leads"),
        fetch("/api/keywords"),
        fetch("/api/channels"),
        fetch("/api/auth/me"),
      ]);

      const leadsData = await leadsRes.json();
      const kwData = await kwRes.json();
      const chData = await chRes.json();
      if (meRes.ok) {
        const meData = await meRes.json();
        if (meData?.user) setUser(meData.user);
      }

      const leads = leadsData.leads || [];
      const keywords = kwData.keywords || [];
      const channels = chData.channels || [];

      const highIntentCount = leads.filter((l: any) => l.intentScore === "HIGH").length;
      const activeChannelsCount = channels.filter((c: any) => c.active).length;

      const tg = channels.find((c: any) => c.type === "TELEGRAM");
      if (tg) {
        setTelegramChannel(tg);
        if (tg.telegramChatId) {
          setTgChatIdInput(tg.telegramChatId);
        }
        if (tg.telegramBotToken) {
          setTgBotTokenInput(tg.telegramBotToken);
        }
      }

      fetch("/api/site-config")
        .then((r) => r.json())
        .then((cfg) => {
          if (cfg?.telegramBotUrl) {
            setTgBotUrl(cfg.telegramBotUrl);
          }
        })
        .catch(() => {});

      setData({
        stats: {
          totalLeads: leads.length,
          highIntentCount,
          activeKeywords: keywords.filter((k: any) => k.active).length,
          connectedChannels: activeChannelsCount,
        },
        recentLeads: leads.slice(0, 6),
      });
    } catch (err) {
      console.error("Failed to load dashboard overview:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTelegram = async () => {
    if (!tgChatIdInput.trim()) {
      setTgMessage({ type: "error", text: "Please enter your Telegram Chat ID (from @userinfobot)." });
      return;
    }
    setTgConnecting(true);
    setTgMessage(null);
    try {
      const res = await fetch("/api/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "TELEGRAM",
          telegramBotToken: tgBotTokenInput.trim() || undefined,
          telegramChatId: tgChatIdInput.trim(),
          active: true,
        }),
      });
      const resData = await res.json();
      if (res.ok) {
        setTelegramChannel(resData.channel);
        setTgMessage({
          type: "success",
          text: "✅ Telegram channel saved successfully! Click 'Send Live Test Ping' below to verify alert delivery on your phone.",
        });
        fetchOverview();
      } else {
        setTgMessage({ type: "error", text: resData.error || "Failed to link Telegram." });
      }
    } catch {
      setTgMessage({ type: "error", text: "Network error saving Telegram settings." });
    } finally {
      setTgConnecting(false);
    }
  };

  const handleTestTelegram = async () => {
    if (!tgChatIdInput.trim()) {
      setTgMessage({ type: "error", text: "Please enter your Telegram Chat ID first." });
      return;
    }
    setTgTesting(true);
    setTgMessage(null);
    try {
      const res = await fetch("/api/channels/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "TELEGRAM",
          botToken: tgBotTokenInput.trim() || undefined,
          chatId: tgChatIdInput.trim(),
        }),
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        setTgMessage({ type: "success", text: `🚀 ${resData.message || "Test alert ping sent! Check your Telegram app."}` });
      } else {
        setTgMessage({ type: "error", text: `⚠️ ${resData.message || resData.error || "Failed to deliver test ping to Telegram."}` });
      }
    } catch {
      setTgMessage({ type: "error", text: "Network error testing Telegram connection." });
    } finally {
      setTgTesting(false);
    }
  };

  useEffect(() => {
    fetchOverview();

    const handleRefresh = () => fetchOverview();
    window.addEventListener("buzzscout:refresh", handleRefresh);
    return () => window.removeEventListener("buzzscout:refresh", handleRefresh);
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Live Buyer Radar
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time high-intent conversations on Reddit and X ready for your pitch.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <Link
            href="/dashboard/keywords"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2"
          >
            <Tag className="w-4 h-4" />
            <span>+ Add Target Keyword</span>
          </Link>
          <Link
            href="/dashboard/leads"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm border border-slate-700 transition-all flex items-center gap-2"
          >
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Open Leads Feed</span>
          </Link>
        </div>
      </div>

      {/* User Profile & Account Panel */}
      <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#0d1628]/95 via-[#0e172a]/95 to-[#0b1220]/95 border border-white/10 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-1/4 w-72 h-32 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          {/* Avatar and Identity */}
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name || "Founder Profile"}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover ring-2 ring-indigo-500/50 shadow-xl shadow-indigo-500/20"
                />
              ) : (
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center font-extrabold text-xl sm:text-2xl text-white ring-2 ring-indigo-500/50 shadow-xl shadow-indigo-500/20">
                  {(user?.name || user?.email || "F").charAt(0).toUpperCase()}
                </div>
              )}
              {/* Online pulse indicator */}
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-[#0d1628]" />
              </span>
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
                  {user?.name || "Verified Founder"}
                </h2>
              </div>
              <p className="text-xs text-slate-400 font-mono truncate">{user?.email}</p>
              <div className="flex flex-wrap items-center gap-2 pt-0.5 text-[11px] text-slate-400">
                <span>Product: <strong className="text-slate-200">{user?.productName || "My Product"}</strong></span>
                <span>•</span>
                <span>Tier: <strong className="text-amber-300">{user?.plan === "LTD" ? "Founder Lifetime ($25 Pass)" : user?.plan === "PRO" ? "Pro Monthly ($5/mo)" : "Active Tier"}</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="flex flex-wrap items-center gap-2.5 pt-3 md:pt-0 border-t md:border-t-0 border-white/5">
            <Link
              href="/dashboard/billing"
              className="px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/10 text-xs font-semibold text-slate-200 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Billing &amp; License Keys</span>
            </Link>
            <Link
              href="/dashboard/channels"
              className="px-3.5 py-2 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/30 text-xs font-semibold text-indigo-300 transition-all flex items-center gap-1.5"
            >
              <Bell className="w-3.5 h-3.5 text-indigo-400" />
              <span>Alert Integrations</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Active Plan & Real-time Services Showcase Card */}
      <div className={`p-5 rounded-2xl sm:rounded-3xl border shadow-xl transition-all ${
        (!user || user.role === "ADMIN" || user.planStatus === "ACTIVE")
          ? "bg-gradient-to-r from-emerald-950/30 via-[#0d1c2c] to-[#0c1827] border-emerald-500/30"
          : "bg-rose-950/40 border-rose-500/30 text-rose-200"
      }`}>
        {(!user || user.role === "ADMIN" || user.planStatus === "ACTIVE") ? (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-white">Active Plan Services Unlocked</h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                      {user?.plan === "LTD" ? "Lifetime Founder Pass" : "Pro Monthly Tier"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">All BuzzScout high-intent monitoring and alert pipelines are active and scanning.</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 flex items-center gap-1.5 self-start sm:self-auto">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Services Live
              </span>
            </div>

            {/* 4 Feature Columns */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                  <Radar className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Live Buyer Radar</span>
                </div>
                <p className="text-[11px] text-emerald-400 font-mono font-bold">● Reddit &amp; X 24/7</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                  <Tag className="w-3.5 h-3.5 text-amber-400" />
                  <span>Keyword Monitor</span>
                </div>
                <p className="text-[11px] text-emerald-400 font-mono font-bold">● Unlimited Tracking</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>AI Pitch Engine</span>
                </div>
                <p className="text-[11px] text-emerald-400 font-mono font-bold">● 1-Click Replies</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                  <Bell className="w-3.5 h-3.5 text-sky-400" />
                  <span>Instant Alerts</span>
                </div>
                <p className="text-[11px] text-emerald-400 font-mono font-bold">● Telegram &amp; Discord</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
                <span>Services Paused — Active Plan Required (Error 403 Forbidden)</span>
              </h3>
              <p className="text-xs text-rose-300/80">
                Buyer radar and alert engines are locked. Subscribe to Pro ($5/mo) or Lifetime Pass ($25) to activate your account.
              </p>
            </div>
            <Link
              href="/dashboard/billing"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-lg shadow-indigo-600/30 text-center shrink-0"
            >
              Choose Plan &amp; Activate
            </Link>
          </div>
        )}
      </div>

      {/* Direct Telegram Mobile Alert Setup Card */}
      <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#0d1627] via-[#0e1b30] to-[#0c1424] border border-sky-500/20 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/20 shrink-0 text-white">
              <Send className="w-5 h-5 -rotate-12 translate-x-0.5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Direct Telegram Mobile Alerts
                </h3>
                {telegramChannel?.active && telegramChannel?.telegramChatId ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Active &amp; Linked</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-semibold">
                    Action Required: Not Connected
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Receive instant push alerts on your phone the second high-intent buyers search for your products or competitors on Reddit &amp; X.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto shrink-0">
            <a
              href={tgBotUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-300 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>1. Open @BotFather</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
            <a
              href="https://t.me/userinfobot"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <span>2. Open @userinfobot</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
          </div>
        </div>

        {/* 30-Second Setup Guide */}
        <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="flex items-start gap-2">
            <span className="h-5 w-5 rounded-full bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
            <p className="text-slate-300">
              Message <a href="https://t.me/BotFather" target="_blank" rel="noreferrer" className="text-sky-400 underline font-semibold">@BotFather</a> on Telegram, type <code className="bg-black/40 px-1 py-0.5 rounded text-sky-200 text-[10px]">/newbot</code>, and copy your HTTP API Token.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <span className="h-5 w-5 rounded-full bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
            <p className="text-slate-300">
              Message <a href="https://t.me/userinfobot" target="_blank" rel="noreferrer" className="text-sky-400 underline font-semibold">@userinfobot</a> to copy your numerical <strong>Id</strong> (Chat ID).
            </p>
          </div>
          <div className="flex items-start gap-2">
            <span className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
            <p className="text-slate-300">
              Tap <strong>START</strong> in your new bot, paste both credentials below, and click <strong>Send Live Test Ping</strong>!
            </p>
          </div>
        </div>

        {/* Dual Input Credentials Form */}
        <div className="pt-2 border-t border-white/5 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  Telegram Bot Token
                </label>
                <a
                  href="https://t.me/BotFather"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-sky-400 hover:text-sky-300 underline"
                >
                  Get token from @BotFather
                </a>
              </div>
              <input
                type="text"
                value={tgBotTokenInput}
                onChange={(e) => setTgBotTokenInput(e.target.value)}
                placeholder="e.g. 7481928491:AAHkL78w9XYZ... (From @BotFather)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  Telegram Chat ID
                </label>
                <a
                  href="https://t.me/userinfobot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-sky-400 hover:text-sky-300 underline"
                >
                  Find ID via @userinfobot
                </a>
              </div>
              <input
                type="text"
                value={tgChatIdInput}
                onChange={(e) => setTgChatIdInput(e.target.value)}
                placeholder="e.g. 192837465 (From @userinfobot)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <button
              onClick={handleSaveTelegram}
              disabled={tgConnecting || !tgChatIdInput}
              className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 shrink-0"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{tgConnecting ? "Saving..." : "Save & Connect Telegram"}</span>
            </button>

            <button
              onClick={handleTestTelegram}
              disabled={tgTesting || !tgChatIdInput}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 shrink-0"
            >
              <Send className="w-3.5 h-3.5 text-sky-400" />
              <span>{tgTesting ? "Sending Live Ping..." : "Send Live Test Ping"}</span>
            </button>

            <Link
              href="/dashboard/channels"
              className="text-xs text-slate-400 hover:text-slate-200 underline ml-auto py-1"
            >
              Manage All Channels (Discord &amp; Telegram) →
            </Link>
          </div>
        </div>

        {tgMessage && (
          <div className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
            tgMessage.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-rose-500/10 border-rose-500/30 text-rose-300"
          }`}>
            {tgMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <span>{tgMessage.text}</span>
          </div>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Card 1 */}
        <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-[#0c1322] border border-white/5 space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">High-Intent Leads</span>
            <div className="h-8 w-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-3xl font-extrabold text-white">
              {loading ? "..." : data?.stats.highIntentCount || 0}
            </span>
            <span className="text-xs text-emerald-400 font-medium">🔥 Active Buyers</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Filtered using buyer-intent trigger words
          </p>
        </div>

        {/* Card 2 */}
        <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-[#0c1322] border border-white/5 space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Tracked Keywords</span>
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-3xl font-extrabold text-white">
              {loading ? "..." : data?.stats.activeKeywords || 0}
            </span>
            <span className="text-xs text-indigo-300 font-medium">Keywords Active</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Monitoring Reddit & X 24/7
          </p>
        </div>

        {/* Card 3 */}
        <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-[#0c1322] border border-white/5 space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Alert Channels</span>
            <div className="h-8 w-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-3xl font-extrabold text-white">
              {loading ? "..." : `${data?.stats.connectedChannels || 0} / 2`}
            </span>
            <span className="text-xs text-slate-300 font-medium">Connected</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Telegram Bot & Discord Webhooks
          </p>
        </div>

        {/* Card 4 */}
        <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-[#0c1322] border border-white/5 space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Opportunities</span>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-3xl font-extrabold text-white">
              {loading ? "..." : data?.stats.totalLeads || 0}
            </span>
            <span className="text-xs text-emerald-400 font-medium">All Time</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Posts matching target keywords
          </p>
        </div>
      </div>

      {/* Setup Guide Banner if channels are not connected */}
      {data && data.stats.connectedChannels === 0 && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-amber-300">
                You haven't connected Telegram or Discord alerts yet!
              </h4>
              <p className="text-xs text-slate-400">
                To receive instant push notifications on your phone within 60 seconds of a post, configure your channels.
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/channels"
            className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shrink-0 transition-colors"
          >
            Connect Channels &rarr;
          </Link>
        </div>
      )}

      {/* Recent Leads Feed Preview */}
      <div className="rounded-2xl bg-[#0c1322] border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              Recent High-Intent Leads
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Click any lead to view full thread or copy tailored AI sales pitch.
            </p>
          </div>
          <Link
            href="/dashboard/leads"
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
          >
            <span>View All Leads</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            Loading leads...
          </div>
        ) : !data?.recentLeads || data.recentLeads.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
              <Flame className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-white">No leads discovered yet</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Add phrases like "alternative to notion" or click "Scan Radar Now" in the top bar to trigger your first social search.
            </p>
            <Link
              href="/dashboard/keywords"
              className="inline-block px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
            >
              Configure Keywords
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {data.recentLeads.map((lead) => (
              <div
                key={lead.id}
                className="p-5 hover:bg-slate-900/40 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        lead.platform === "REDDIT"
                          ? "bg-[#ff4500]/10 text-[#ff4500] border border-[#ff4500]/20"
                          : "bg-[#1da1f2]/10 text-[#1da1f2] border border-[#1da1f2]/20"
                      }`}
                    >
                      {lead.platform} {lead.sourceSubreddit ? `(r/${lead.sourceSubreddit})` : ""}
                    </span>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        lead.intentScore === "HIGH"
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          : lead.intentScore === "MEDIUM"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {lead.intentScore === "HIGH" ? "🔥 High Intent" : "⚡ Medium"}
                    </span>

                    <span className="text-[11px] text-slate-500 font-mono">
                      Matched: <span className="text-slate-300">{lead.keyword.phrase}</span>
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-white hover:text-indigo-300 transition-colors">
                    <a href={lead.url} target="_blank" rel="noopener noreferrer">
                      {lead.title}
                    </a>
                  </h4>

                  <p className="text-xs text-slate-400 line-clamp-2">
                    "{lead.content}"
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <Link
                    href={`/dashboard/leads?highlight=${lead.id}`}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Pitch Lead</span>
                  </Link>

                  <a
                    href={lead.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    title="Open original post"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
