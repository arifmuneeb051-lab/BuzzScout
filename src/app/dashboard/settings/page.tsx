"use client";

import { useEffect, useState } from "react";
import { User, Settings as SettingsIcon, Save, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    productName: "",
    productUrl: "",
    productPitch: "",
  });

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
          setFormData({
            name: data.user.name || "",
            productName: data.user.productName || "",
            productUrl: data.user.productUrl || "",
            productPitch: data.user.productPitch || "",
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Profile updated successfully." });
      } else {
        const errorData = await res.json();
        setMessage({ type: "error", text: errorData.error || "Failed to update profile." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Network error occurred." });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-500 text-sm">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-indigo-400" />
            Account Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage your personal profile and product details for the AI Pitch Engine.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
        <div className="p-6 rounded-2xl bg-[#0c1322] border border-white/5 space-y-6">
          <div className="flex items-center gap-4 border-b border-white/5 pb-4">
            <div className="h-12 w-12 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Founder Profile</h3>
              <p className="text-xs text-slate-400">Update your name and product metadata.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="e.g. John Doe"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Product Name</label>
              <input
                type="text"
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="e.g. BuzzScout"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Product URL</label>
              <input
                type="url"
                value={formData.productUrl}
                onChange={(e) => setFormData({ ...formData, productUrl: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="e.g. https://buzzscout.io"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Product Pitch (Used by AI)</label>
              <textarea
                value={formData.productPitch}
                onChange={(e) => setFormData({ ...formData, productPitch: e.target.value })}
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                placeholder="e.g. A fast, affordable solution to find leads on autopilot."
              />
              <p className="text-[11px] text-slate-500 mt-1">
                The AI Pitch Engine uses this description to automatically draft personalized sales replies for your leads.
              </p>
            </div>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 border ${
            message.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-rose-500/10 border-rose-500/30 text-rose-400"
          }`}>
            {message.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            {message.text}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>

      {/* Telegram Integration Section */}
      <div className="max-w-3xl pt-6">
        <div className="p-6 rounded-2xl bg-[#0c1322] border border-sky-500/20 space-y-6 shadow-lg shadow-sky-900/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Telegram Alerts (1-Click Connect)</h3>
                <p className="text-xs text-slate-400">Receive instant push notifications on your phone.</p>
              </div>
            </div>
            
            {/* 1-Click Connect Button */}
            <a
              href={`https://t.me/${process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'BuzzScoutBot'}?start=${user?.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 shrink-0"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
              Connect Telegram
            </a>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-start gap-2">
              <span className="h-5 w-5 rounded-full bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
              <p className="text-slate-300 mt-0.5">
                Click the <strong>Connect Telegram</strong> button above.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
              <p className="text-slate-300 mt-0.5">
                Click <strong>START</strong> in the bot, and you're done!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
