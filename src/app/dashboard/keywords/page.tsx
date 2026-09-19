"use client";

import { useEffect, useState } from "react";
import {
  Tag,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Flame,
  Sparkles,
  Search,
} from "lucide-react";

interface Keyword {
  id: string;
  phrase: string;
  platform: string;
  negativeKeywords?: string | null;
  targetSubreddits?: string | null;
  active: boolean;
  leadsCount: number;
  lastCheckedAt?: string | null;
  createdAt: string;
  _count?: { leads: number };
}

const HIGH_INTENT_TEMPLATES = [
  { phrase: "alternative to notion", platform: "ALL", desc: "Captures frustrated Notion users seeking simpler tools" },
  { phrase: "recommend social listening", platform: "ALL", desc: "Finds buyers asking for Brand24 / Mention alternatives" },
  { phrase: "tired of hubspot", platform: "REDDIT", desc: "Targets small teams looking to switch from expensive CRMs" },
  { phrase: "best tool for scheduling posts", platform: "TWITTER", desc: "Finds creators and marketers looking for Buffer alternatives" },
];

export default function KeywordsPage() {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    phrase: "",
    platform: "ALL",
    negativeKeywords: "hiring, job, intern, cracked, free",
    targetSubreddits: "SaaS, startups, Entrepreneur",
  });

  const fetchKeywords = async () => {
    try {
      const res = await fetch("/api/keywords");
      const data = await res.json();
      if (res.ok) {
        setKeywords(data.keywords || []);
      }
    } catch {
      console.error("Failed to load keywords");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeywords();
  }, []);

  const handleAddKeyword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const res = await fetch("/api/keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to add keyword");
        return;
      }

      setFormData({
        phrase: "",
        platform: "ALL",
        negativeKeywords: "hiring, job, intern, cracked, free",
        targetSubreddits: "SaaS, startups, Entrepreneur",
      });
      setShowAddModal(false);
      fetchKeywords();
    } catch {
      setError("Network error adding keyword");
    }
  };

  const handleApplyTemplate = (tpl: typeof HIGH_INTENT_TEMPLATES[0]) => {
    setFormData({
      ...formData,
      phrase: tpl.phrase,
      platform: tpl.platform,
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tracked phrase?")) return;
    try {
      const res = await fetch(`/api/keywords?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setKeywords((prev) => prev.filter((k) => k.id !== id));
      }
    } catch {
      alert("Failed to delete keyword");
    }
  };

  const handleToggle = async (id: string, currentActive: boolean) => {
    try {
      const res = await fetch("/api/keywords", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, active: !currentActive }),
      });
      if (res.ok) {
        setKeywords((prev) =>
          prev.map((k) => (k.id === id ? { ...k, active: !currentActive } : k))
        );
      }
    } catch {
      alert("Failed to toggle keyword state");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Tag className="w-6 h-6 text-indigo-400" />
            Tracked Keywords & Phrases
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            SignalPulse scans social conversations matching these exact phrases and filters.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Phrase</span>
        </button>
      </div>

      {/* High-Converting Templates Bar */}
      <div className="p-5 rounded-2xl bg-[#0c1322] border border-white/5 space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          Recommended High-Intent Phrases (Click to use)
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {HIGH_INTENT_TEMPLATES.map((tpl) => (
            <button
              key={tpl.phrase}
              onClick={() => handleApplyTemplate(tpl)}
              className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 text-left transition-all group"
            >
              <span className="text-xs font-bold text-white group-hover:text-indigo-300 block truncate">
                "{tpl.phrase}"
              </span>
              <span className="text-[11px] text-slate-400 block mt-1 line-clamp-1">
                {tpl.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Keywords Table */}
      <div className="rounded-2xl bg-[#0c1322] border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Active Radar Keywords ({keywords.length})</h3>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            Loading keywords...
          </div>
        ) : keywords.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
              <Tag className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-white">No keywords tracked yet</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Add phrases your ideal customers use when complaining about competitors or seeking software.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
            >
              Add Your First Phrase
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-6">Phrase</th>
                  <th className="py-3 px-6">Platform</th>
                  <th className="py-3 px-6">Negative Filter</th>
                  <th className="py-3 px-6">Leads Found</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {keywords.map((kw) => (
                  <tr key={kw.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-4 px-6">
                      <span className="font-bold text-white text-sm block">
                        "{kw.phrase}"
                      </span>
                      {kw.targetSubreddits && (
                        <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                          Subs: {kw.targetSubreddits}
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-6">
                      <span
                        className={`inline-block px-2 py-0.5 rounded font-semibold text-[10px] uppercase ${
                          kw.platform === "REDDIT"
                            ? "bg-[#ff4500]/10 text-[#ff4500] border border-[#ff4500]/20"
                            : kw.platform === "TWITTER"
                            ? "bg-[#1da1f2]/10 text-[#1da1f2] border border-[#1da1f2]/20"
                            : "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                        }`}
                      >
                        {kw.platform}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-slate-400 max-w-[200px] truncate">
                      {kw.negativeKeywords || <span className="text-slate-600">None</span>}
                    </td>

                    <td className="py-4 px-6">
                      <span className="font-bold text-emerald-400 flex items-center gap-1 text-sm">
                        <Flame className="w-3.5 h-3.5" />
                        {kw._count?.leads ?? kw.leadsCount}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleToggle(kw.id, kw.active)}
                        className="flex items-center gap-1.5 focus:outline-none"
                      >
                        {kw.active ? (
                          <>
                            <span className="h-2 w-2 rounded-full bg-emerald-400" />
                            <span className="text-emerald-400 font-semibold">Active</span>
                          </>
                        ) : (
                          <>
                            <span className="h-2 w-2 rounded-full bg-slate-600" />
                            <span className="text-slate-500 font-semibold">Paused</span>
                          </>
                        )}
                      </button>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleDelete(kw.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete keyword"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Keyword Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0e1627] border border-white/10 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Tag className="w-5 h-5 text-indigo-400" />
                Add Target Buyer Phrase
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleAddKeyword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Target Phrase
                </label>
                <input
                  type="text"
                  required
                  value={formData.phrase}
                  onChange={(e) => setFormData({ ...formData, phrase: e.target.value })}
                  placeholder="e.g. alternative to brand24"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Best phrases start with "alternative to", "recommend tool", or "tired of".
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Platform
                  </label>
                  <select
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="ALL">Reddit & X (Both)</option>
                    <option value="REDDIT">Reddit Only</option>
                    <option value="TWITTER">X (Twitter) Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Target Subreddits (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.targetSubreddits}
                    onChange={(e) => setFormData({ ...formData, targetSubreddits: e.target.value })}
                    placeholder="SaaS, startups"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Negative Keywords (Exclusions)
                </label>
                <input
                  type="text"
                  value={formData.negativeKeywords}
                  onChange={(e) => setFormData({ ...formData, negativeKeywords: e.target.value })}
                  placeholder="hiring, job, intern, cracked"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Posts containing these terms will be automatically discarded to eliminate spam.
                </p>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-400 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md"
                >
                  Start Monitoring Phrase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
