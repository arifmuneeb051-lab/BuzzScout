"use client";

import { useEffect, useState } from "react";
import { Key, Plus, Copy, Check, ShieldCheck, Tag } from "lucide-react";

interface License {
  id: string;
  code: string;
  plan: string;
  isUsed: boolean;
  usedByEmail?: string | null;
  createdAt: string;
  redeemedAt?: string | null;
}

export default function AdminLicensesPage() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [customCode, setCustomCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchLicenses = async () => {
    try {
      const res = await fetch("/api/admin/licenses");
      const data = await res.json();
      if (res.ok && data.licenses) {
        setLicenses(data.licenses);
      }
    } catch {
      console.error("Failed to load licenses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLicenses();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);

    try {
      const res = await fetch("/api/admin/licenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customCode }),
      });

      if (res.ok) {
        setCustomCode("");
        fetchLicenses();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to generate key");
      }
    } catch {
      alert("Network error generating key");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Key className="w-6 h-6 text-amber-400" />
            LTD License Key Manager
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Generate and manage promotional Lifetime Deal redemption codes for AppSumo, Product Hunt, or direct sales.
          </p>
        </div>
      </div>

      {/* Generator Card */}
      <div className="p-6 rounded-3xl bg-[#0c101c] border border-white/10 space-y-4 shadow-xl">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider text-amber-400 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Generate New Lifetime License
        </h3>

        <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={customCode}
            onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
            placeholder="Custom Code (optional, e.g. LAUNCH-PRO-2026)"
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500 font-mono uppercase"
          />
          <button
            type="submit"
            disabled={generating}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Key className="w-3.5 h-3.5" />
            <span>{generating ? "Generating..." : "Generate 1-Click Code"}</span>
          </button>
        </form>
      </div>

      {/* Licenses List */}
      <div className="rounded-3xl bg-[#0c101c] border border-white/10 overflow-hidden shadow-xl">
        <div className="p-5 border-b border-white/10">
          <h3 className="text-sm font-bold text-white">Active & Redeemed Licenses ({licenses.length})</h3>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            Loading licenses...
          </div>
        ) : licenses.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            No licenses generated yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-6">License Code</th>
                  <th className="py-3 px-6">Plan</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6">Redeemed By</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {licenses.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-white">
                      {l.code}
                    </td>
                    <td className="py-4 px-6 font-semibold text-amber-400">
                      {l.plan}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          l.isUsed
                            ? "bg-slate-800 text-slate-400"
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        }`}
                      >
                        {l.isUsed ? "Redeemed" : "Available"}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono text-slate-300">
                      {l.usedByEmail || <span className="text-slate-600">—</span>}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleCopy(l.id, l.code)}
                        className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                      >
                        {copiedId === l.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
