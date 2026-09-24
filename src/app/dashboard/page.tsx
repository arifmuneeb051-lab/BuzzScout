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
