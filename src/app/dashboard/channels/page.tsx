"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  Send,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Zap,
} from "lucide-react";

interface Channel {
  id: string;
  type: "TELEGRAM" | "DISCORD";
  telegramBotToken?: string | null;
  telegramChatId?: string | null;
  discordWebhookUrl?: string | null;
  active: boolean;
}

export default function ChannelsPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);

  // Telegram Form State
  const [telegramToken, setTelegramToken] = useState("");
  const [telegramChatId, setTelegramChatId] = useState("");
  const [telegramActive, setTelegramActive] = useState(true);
  const [telegramStatus, setTelegramStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [telegramTesting, setTelegramTesting] = useState(false);

  // Discord Form State
  const [discordUrl, setDiscordUrl] = useState("");
  const [discordActive, setDiscordActive] = useState(true);
  const [discordStatus, setDiscordStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [discordTesting, setDiscordTesting] = useState(false);

  const fetchChannels = async () => {
    try {
      const res = await fetch("/api/channels");
      const data = await res.json();
      if (res.ok && data.channels) {
        setChannels(data.channels);

        const tg = data.channels.find((c: any) => c.type === "TELEGRAM");
        if (tg) {
          setTelegramToken(tg.telegramBotToken || "");
          setTelegramChatId(tg.telegramChatId || "");
          setTelegramActive(tg.active);
        }

        const dc = data.channels.find((c: any) => c.type === "DISCORD");
        if (dc) {
          setDiscordUrl(dc.discordWebhookUrl || "");
          setDiscordActive(dc.active);
        }
      }
    } catch {
      console.error("Failed to fetch channels");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChannels();
  }, []);

  const handleSaveTelegram = async (e: React.FormEvent) => {
    e.preventDefault();
    setTelegramStatus(null);
    try {
      const res = await fetch("/api/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "TELEGRAM",
          telegramBotToken: telegramToken,
          telegramChatId: telegramChatId,
          active: telegramActive,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setTelegramStatus({ type: "success", text: "Telegram configuration saved successfully!" });
        fetchChannels();
      } else {
        setTelegramStatus({ type: "error", text: data.error || "Failed to save Telegram settings" });
      }
    } catch {
      setTelegramStatus({ type: "error", text: "Network error saving Telegram settings" });
    }
  };

  const handleTestTelegram = async () => {
    setTelegramTesting(true);
    setTelegramStatus(null);
    try {
      const res = await fetch("/api/channels/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "TELEGRAM",
          botToken: telegramToken,
          chatId: telegramChatId,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setTelegramStatus({ type: "success", text: "Test ping successfully received on your Telegram!" });
      } else {
        setTelegramStatus({ type: "error", text: data.message || "Failed to deliver test message. Check your bot token and chat ID." });
      }
    } catch {
      setTelegramStatus({ type: "error", text: "Network error testing Telegram connection." });
    } finally {
      setTelegramTesting(false);
    }
  };

  const handleSaveDiscord = async (e: React.FormEvent) => {
    e.preventDefault();
    setDiscordStatus(null);
    try {
      const res = await fetch("/api/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "DISCORD",
          discordWebhookUrl: discordUrl,
          active: discordActive,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setDiscordStatus({ type: "success", text: "Discord webhook saved successfully!" });
        fetchChannels();
      } else {
        setDiscordStatus({ type: "error", text: data.error || "Failed to save Discord webhook" });
      }
    } catch {
      setDiscordStatus({ type: "error", text: "Network error saving Discord webhook" });
    }
  };

  const handleTestDiscord = async () => {
    setDiscordTesting(true);
    setDiscordStatus(null);
    try {
      const res = await fetch("/api/channels/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "DISCORD",
          webhookUrl: discordUrl,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setDiscordStatus({ type: "success", text: "Test embed card successfully posted in your Discord channel!" });
      } else {
        setDiscordStatus({ type: "error", text: data.message || "Failed to deliver Discord test. Please check the webhook URL." });
      }
    } catch {
      setDiscordStatus({ type: "error", text: "Network error testing Discord connection." });
    } finally {
      setDiscordTesting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <Bell className="w-6 h-6 text-sky-400" />
          Alert Channels & Notifications
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Receive instantaneous alerts with ready-to-send AI pitches on your phone and desktop.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Telegram Bot Setup */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#0c1322] border border-white/5 space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-xl bg-[#229ed9]/15 text-[#229ed9] flex items-center justify-center border border-[#229ed9]/30">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Telegram Bot</h3>
                  <p className="text-xs text-slate-400">Direct mobile push notifications</p>
                </div>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  telegramToken && telegramChatId && telegramActive
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                {telegramToken && telegramChatId && telegramActive ? "Connected" : "Not Configured"}
              </span>
            </div>

            {/* Quick 2-Minute Guide */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs text-slate-300">
              <span className="font-bold text-white block mb-1">⚡ How to get your Bot Token & Chat ID in 2 minutes:</span>
              <p>1. Open Telegram, message <a href="https://t.me/BotFather" target="_blank" rel="noreferrer" className="text-sky-400 underline font-semibold">@BotFather</a> and send <code className="bg-black/50 px-1 py-0.5 rounded text-sky-200">/newbot</code> to get your Bot Token.</p>
              <p>2. Start your bot, then message <a href="https://t.me/userinfobot" target="_blank" rel="noreferrer" className="text-sky-400 underline font-semibold">@userinfobot</a> to copy your numerical <strong>Id</strong> (Chat ID).</p>
            </div>

            {telegramStatus && (
              <div
                className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                  telegramStatus.type === "success"
                    ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300"
                    : "bg-rose-500/10 border border-rose-500/20 text-rose-300"
                }`}
              >
                {telegramStatus.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{telegramStatus.text}</span>
              </div>
            )}

            <form onSubmit={handleSaveTelegram} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Telegram Bot Token
                </label>
                <input
                  type="text"
                  value={telegramToken}
                  onChange={(e) => setTelegramToken(e.target.value)}
                  placeholder="e.g. 7481928491:AAHkL78w..."
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Your Telegram Chat ID
                </label>
                <input
                  type="text"
                  value={telegramChatId}
                  onChange={(e) => setTelegramChatId(e.target.value)}
                  placeholder="e.g. 192837465"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="tgActive"
                  checked={telegramActive}
                  onChange={(e) => setTelegramActive(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="tgActive" className="text-xs text-slate-300 select-none">
                  Enable Telegram Notifications
                </label>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md transition-colors"
                >
                  Save Telegram Settings
                </button>
                <button
                  type="button"
                  onClick={handleTestTelegram}
                  disabled={telegramTesting || !telegramToken || !telegramChatId}
                  className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>{telegramTesting ? "Sending..." : "Test Ping"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Discord Webhook Setup */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#0c1322] border border-white/5 space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-xl bg-[#5865f2]/15 text-[#5865f2] flex items-center justify-center border border-[#5865f2]/30">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Discord Webhook</h3>
                  <p className="text-xs text-slate-400">Team channel lead embeds</p>
                </div>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  discordUrl && discordActive
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                {discordUrl && discordActive ? "Connected" : "Not Configured"}
              </span>
            </div>

            {/* Quick Guide */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs text-slate-300">
              <span className="font-bold text-white block mb-1">⚡ How to get your Discord Webhook in 60 seconds:</span>
              <p>1. In your Discord server, go to <strong>Server Settings &gt; Integrations &gt; Webhooks</strong>.</p>
              <p>2. Click <strong>New Webhook</strong>, select your target channel (e.g. <code>#buyer-leads</code>), and click <strong>Copy Webhook URL</strong>.</p>
            </div>

            {discordStatus && (
              <div
                className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                  discordStatus.type === "success"
                    ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300"
                    : "bg-rose-500/10 border border-rose-500/20 text-rose-300"
                }`}
              >
                {discordStatus.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{discordStatus.text}</span>
              </div>
            )}

            <form onSubmit={handleSaveDiscord} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Discord Webhook URL
                </label>
                <input
                  type="url"
                  value={discordUrl}
                  onChange={(e) => setDiscordUrl(e.target.value)}
                  placeholder="https://discord.com/api/webhooks/12345678/abcde..."
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="dcActive"
                  checked={discordActive}
                  onChange={(e) => setDiscordActive(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="dcActive" className="text-xs text-slate-300 select-none">
                  Enable Discord Alerts
                </label>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md transition-colors"
                >
                  Save Discord Webhook
                </button>
                <button
                  type="button"
                  onClick={handleTestDiscord}
                  disabled={discordTesting || !discordUrl}
                  className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>{discordTesting ? "Sending..." : "Test Ping"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
