"use client";

import { useEffect, useState } from "react";
import { Key, Plus, Copy, Check, ShieldCheck, Tag, Sparkles, Send } from "lucide-react";

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
  const [selectedPlan, setSelectedPlan] = useState("LTD");
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
        body: JSON.stringify({ customCode, plan: selectedPlan }),
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
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Key className="w-6 h-6 text-amber-400" />
            Admin License &amp; Free Key Generator
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Generate free access keys for any plan (LTD, PRO) and send them to clients. Users can enter their key on the registration page to automatically activate their plan.
          </p>
        </div>
      </div>

      {/* How it Works Banner */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-3">
        <Sparkles className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
        <div>
          <strong className="block font-bold mb-0.5 text-white">Self-Service Registration Workflow:</strong>
          <span>
            Admin generates a key here ➔ Copies &amp; sends it to the user ➔ User visits <strong>/register</strong> ➔ Enters their account details and pastes this key ➔ Their account is created and plan is instantly activated with $0 payment!
          </span>
        </div>
      </div>

      {/* Generator Card */}
      <div className="p-6 rounded-3xl bg-[#0c101c] border border-white/10 space-y-4 shadow-xl">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider text-amber-400 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Generate New Key for Any Plan
        </h3>

        <form onSubmit={handleGenerate} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-4">
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Assign Plan
            </label>
            <select
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
            >
              <option value="LTD">LTD (Lifetime Founder Pass - $25 Value)</option>
              <option value="PRO">PRO (Pro Monthly Pass - $5/mo Value)</option>
            </select>
          </div>

          <div className="sm:col-span-5">
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Custom Key Code (Optional)
            </label>
            <input
              type="text"
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
              placeholder="Leave blank for auto BUZZ-..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500 font-mono uppercase"
            />
          </div>

          <div className="sm:col-span-3 flex items-end">
            <button
              type="submit"
              disabled={generating}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Key className="w-3.5 h-3.5" />
              <span>{generating ? "Generating..." : "Generate Key"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Licenses List */}
      <div className="rounded-3xl bg-[#0c101c] border border-white/10 overflow-hidden shadow-xl">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Active &amp; Redeemed Keys ({licenses.length})</h3>
          <span className="text-xs text-slate-400 font-mono">
            {licenses.filter(l => !l.isUsed).length} available / {licenses.filter(l => l.isUsed).length} redeemed
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            Loading keys...
          </div>
        ) : licenses.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            No license keys generated yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-6">License Key Code</th>
                  <th className="py-3 px-6">Target Plan</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6">Claimed By User</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {licenses.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-white tracking-wider">
                      {l.code}
                    </td>
                    <td className="py-4 px-6 font-semibold">
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300 font-bold text-[11px]">
                        {l.plan}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          l.isUsed
                            ? "bg-slate-800 text-slate-400"
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        }`}
                      >
                        {l.isUsed ? "Redeemed / Claimed" : "🟢 Ready to Send"}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono text-slate-300">
                      {l.usedByEmail ? (
                        <span className="text-emerald-400">{l.usedByEmail}</span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
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
                            <span>Copy Key</span>
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
