"use client";

import { useEffect, useState } from "react";
import { Sliders, Save, CheckCircle2, AlertCircle, Sparkles, Eye, RefreshCw } from "lucide-react";

export default function AdminSettingsPage() {
  const [formData, setFormData] = useState({
    heroHeadline: "",
    heroSubtitle: "",
    announcementText: "",
    ctaButtonText: "Launch Radar",
    telegramBotUrl: "https://t.me/BotFather",
    telegramBotToken: "",
    supportEmail: "support@buzzscout.io",
    monthlyPrice: 9,
    ltdPrice: 49,
    agencyPrice: 79,
    stripeSecretKey: "",
    stripePublishableKey: "",
    stripePaymentLink: "",
    stripeMonthlyLink: "",
    stripeLtdLink: "",
    stripeAgencyLink: "",
    paymentMode: "TEST",
  });

  // Admin Credentials State
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminConfirmPassword, setAdminConfirmPassword] = useState("");
  const [credSaving, setCredSaving] = useState(false);
  const [credMessage, setCredMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/admin/config");
      const data = await res.json();
      if (res.ok && data.config) {
        setFormData({
          heroHeadline: data.config.heroHeadline || "",
          heroSubtitle: data.config.heroSubtitle || "",
          announcementText: data.config.announcementText || "",
          ctaButtonText: data.config.ctaButtonText || "Launch Radar",
          telegramBotUrl: data.config.telegramBotUrl || "https://t.me/BotFather",
          telegramBotToken: data.config.telegramBotToken || "",
          supportEmail: data.config.supportEmail || "support@buzzscout.io",
          monthlyPrice: data.config.monthlyPrice || 9,
          ltdPrice: data.config.ltdPrice || 49,
          agencyPrice: data.config.agencyPrice || 79,
          stripeSecretKey: data.config.stripeSecretKey || "",
          stripePublishableKey: data.config.stripePublishableKey || "",
          stripePaymentLink: data.config.stripePaymentLink || "",
          stripeMonthlyLink: data.config.stripeMonthlyLink || "",
          stripeLtdLink: data.config.stripeLtdLink || "",
          stripeAgencyLink: data.config.stripeAgencyLink || "",
          paymentMode: data.config.paymentMode || "TEST",
        });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to load current configuration." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage({
          type: "success",
          text: "Frontend Site Configuration updated and published live to visitors!",
        });
      } else {
        setMessage({ type: "error", text: data.error || "Failed to save configuration" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error saving site settings" });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredSaving(true);
    setCredMessage(null);

    if (adminPassword && adminPassword !== adminConfirmPassword) {
      setCredMessage({ type: "error", text: "Passwords do not match. Please enter the same password in both fields." });
      setCredSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newEmail: adminEmail || undefined,
          newPassword: adminPassword || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setCredMessage({
          type: "success",
          text: data.message || "Admin login credentials successfully updated! Your new details are active.",
        });
        setAdminPassword("");
        setAdminConfirmPassword("");
      } else {
        setCredMessage({ type: "error", text: data.error || "Failed to update admin credentials" });
      }
    } catch {
      setCredMessage({ type: "error", text: "Network error updating admin credentials" });
    } finally {
      setCredSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <Sliders className="w-6 h-6 text-amber-400" />
          Frontend Site Configurator (CMS)
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Modify the client landing page text, pricing, and payment links directly without altering backend source code.
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center gap-2.5 border ${
            message.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
              : "bg-rose-500/10 border-rose-500/20 text-rose-300"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Copy / Content Card */}
        <div className="p-6 rounded-3xl bg-[#0c101c] border border-white/10 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider text-amber-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Hero & Messaging Content
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Top Announcement Banner Bar
            </label>
            <input
              type="text"
              value={formData.announcementText}
              onChange={(e) => setFormData({ ...formData, announcementText: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Main Hero Headline
            </label>
            <input
              type="text"
              value={formData.heroHeadline}
              onChange={(e) => setFormData({ ...formData, heroHeadline: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm font-bold text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Hero Subtitle / Description
            </label>
            <textarea
              rows={3}
              value={formData.heroSubtitle}
              onChange={(e) => setFormData({ ...formData, heroSubtitle: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500 leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Primary CTA Button Text
              </label>
              <input
                type="text"
                value={formData.ctaButtonText}
                onChange={(e) => setFormData({ ...formData, ctaButtonText: e.target.value })}
                placeholder="Launch Radar"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Telegram Bot Link / Username
              </label>
              <input
                type="text"
                value={formData.telegramBotUrl}
                onChange={(e) => setFormData({ ...formData, telegramBotUrl: e.target.value })}
                placeholder="https://t.me/YourPlatformBot (or @BotFather)"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-sky-300 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Global Telegram Bot Token (Optional)
              </label>
              <input
                type="password"
                value={formData.telegramBotToken}
                onChange={(e) => setFormData({ ...formData, telegramBotToken: e.target.value })}
                placeholder="e.g. 7481928491:AAHkL78w..."
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">From @BotFather. Enables instant 1-click alerts for all users.</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Support Email
              </label>
              <input
                type="email"
                value={formData.supportEmail}
                onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
                placeholder="support@buzzscout.io"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Pricing Plans Card */}
        <div className="p-6 rounded-3xl bg-[#0c101c] border border-white/10 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider text-amber-400 flex items-center gap-2">
            <Sliders className="w-4 h-4" />
            Pricing Plans & Rates
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Monthly Plan ($)
              </label>
              <input
                type="number"
                min="1"
                value={formData.monthlyPrice}
                onChange={(e) => setFormData({ ...formData, monthlyPrice: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm font-bold text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Lifetime Deal ($)
              </label>
              <input
                type="number"
                min="1"
                value={formData.ltdPrice}
                onChange={(e) => setFormData({ ...formData, ltdPrice: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm font-bold text-emerald-400 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Payment Gateway & Stripe Owner Configuration */}
        <div className="p-6 rounded-3xl bg-[#0b0f19]/90 border border-white/10 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Stripe & Payment Gateway Settings (Direct Bank Routing)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Paste your Stripe Payment Links (created inside your Stripe Dashboard) so customer payments route directly to your bank account.
              </p>
            </div>
            <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
              Direct Settlement
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Payment Mode
              </label>
              <select
                value={formData.paymentMode || "TEST"}
                onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
              >
                <option value="TEST">🧪 Test Mode (Simulated / Stripe Test)</option>
                <option value="LIVE">🚀 Live Mode (Real Bank Processing)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Pro Monthly ($5/mo) Stripe Link
              </label>
              <input
                type="text"
                placeholder="https://buy.stripe.com/monthly_tier..."
                value={formData.stripeMonthlyLink || ""}
                onChange={(e) => setFormData({ ...formData, stripeMonthlyLink: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Lifetime Deal ($25 LTD) Stripe Link (Most Popular)
              </label>
              <input
                type="text"
                placeholder="https://buy.stripe.com/ltd_founder..."
                value={formData.stripeLtdLink || ""}
                onChange={(e) => setFormData({ ...formData, stripeLtdLink: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-amber-300 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Global Fallback Stripe Link
              </label>
              <input
                type="text"
                placeholder="https://buy.stripe.com/fallback..."
                value={formData.stripePaymentLink || ""}
                onChange={(e) => setFormData({ ...formData, stripePaymentLink: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Stripe Secret Key (sk_live_... or sk_test_...)
              </label>
              <input
                type="password"
                placeholder="sk_test_51..."
                value={formData.stripeSecretKey || ""}
                onChange={(e) => setFormData({ ...formData, stripeSecretKey: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-amber-300 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Stripe Publishable Key (pk_live_... or pk_test_...)
              </label>
              <input
                type="text"
                placeholder="pk_test_51..."
                value={formData.stripePublishableKey || ""}
                onChange={(e) => setFormData({ ...formData, stripePublishableKey: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-slate-300 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview Client Landing Page</span>
          </a>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-amber-600/30 transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Publishing Changes..." : "Publish to Live Site"}</span>
          </button>
        </div>
      </form>

      {/* =========================================================
          ADMIN CREDENTIALS & MASTER SECURITY (Change Username/Password)
          ========================================================= */}
      <div className="p-6 rounded-3xl bg-[#0b0f19]/90 border border-amber-500/20 shadow-2xl space-y-5 mt-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Admin Portal Security & Credentials (Change Login)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Change the master administrator login email (username) and password from here at any time.
            </p>
          </div>
          <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold">
            Owner Access Only
          </span>
        </div>

        {credMessage && (
          <div
            className={`p-4 rounded-2xl text-xs flex items-center gap-2.5 border ${
              credMessage.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                : "bg-rose-500/10 border-rose-500/20 text-rose-300"
            }`}
          >
            {credMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span className="font-medium">{credMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleUpdateCredentials} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                New Admin Email / Username
              </label>
              <input
                type="email"
                placeholder="owner@yourdomain.com"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Leave blank if keeping current email
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                New Admin Password
              </label>
              <input
                type="password"
                placeholder="At least 6 characters"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Leave blank if keeping current password
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                placeholder="Re-enter new password"
                value={adminConfirmPassword}
                onChange={(e) => setAdminConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-slate-400">
              Master Admin: <span className="font-mono text-amber-300 font-bold">Configured in .env (Single Owner Restricted)</span>
            </p>

            <button
              type="submit"
              disabled={credSaving}
              className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-600/30 transition-all flex items-center gap-2"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{credSaving ? "Updating Credentials..." : "Update Admin Login"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
