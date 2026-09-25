"use client";

import { useEffect, useState } from "react";
import { Key, Plus, Copy, Check, Trash2, Pin, Search, ShieldCheck, Zap } from "lucide-react";

interface License {
  id: string;
  code: string;
  plan: string;
  isUsed: boolean;
  usedByEmail?: string | null;
  lockedToEmail?: string | null;
  expiresAt?: string | null;
  isPinned: boolean;
  createdAt: string;
  redeemedAt?: string | null;
}

export default function AdminLicensesPage() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [customCode, setCustomCode] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("LTD");
  const [lockedEmail, setLockedEmail] = useState("");
  const [validDays, setValidDays] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"UNUSED" | "USED">("UNUSED");

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

  const handleGenerate = async (e?: React.FormEvent, forcePlan?: string) => {
    if (e) e.preventDefault();
    setGenerating(true);

    try {
      const res = await fetch("/api/admin/licenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          customCode, 
          plan: forcePlan || selectedPlan,
          lockedToEmail: lockedEmail || undefined,
          validDays: validDays || undefined
        }),
      });

      if (res.ok) {
        setCustomCode("");
        setLockedEmail("");
        setValidDays("");
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

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this key?")) return;
    try {
      const res = await fetch(`/api/admin/licenses?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchLicenses();
    } catch {
      alert("Failed to delete key");
    }
  };

  const handleTogglePin = async (id: string, currentPin: boolean) => {
    try {
      const res = await fetch("/api/admin/licenses", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isPinned: !currentPin }),
      });
      if (res.ok) fetchLicenses();
    } catch {
      alert("Failed to toggle pin");
    }
  };

  const handleCopy = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const filteredLicenses = licenses.filter(l => 
    (activeTab === "USED" ? l.isUsed : !l.isUsed) &&
    (l.code.toLowerCase().includes(search.toLowerCase()) || 
     (l.usedByEmail && l.usedByEmail.toLowerCase().includes(search.toLowerCase())) ||
     (l.lockedToEmail && l.lockedToEmail.toLowerCase().includes(search.toLowerCase())))
  );

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Key className="w-6 h-6 text-amber-400" />
            License Keys & Vault
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Generate and manage access keys. The system auto-prunes used keys to keep the last 100.
          </p>
        </div>
      </div>

      {/* Generator Form */}
      <div className="p-6 rounded-3xl bg-[#0b0f19] border border-slate-800 shadow-xl">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h2 className="font-bold text-white text-sm">Key Generator</h2>
        </div>
        
        <form onSubmit={(e) => handleGenerate(e)} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Plan Type</label>
            <select
              value={selectedPlan}
              onChange={(e) => {
                setSelectedPlan(e.target.value);
                if (e.target.value === "LTD") setValidDays("");
              }}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
            >
              <option value="LTD">LTD (Lifetime)</option>
              <option value="PRO">PRO (Subscription)</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Custom Code (Optional)</label>
            <input
              type="text"
              placeholder="Leave blank for random"
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-white focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Lock to Email (Optional)</label>
            <input
              type="email"
              placeholder="user@domain.com"
              value={lockedEmail}
              onChange={(e) => setLockedEmail(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Valid Days (Optional)</label>
            <input
              type="number"
              placeholder={selectedPlan === "LTD" ? "N/A for LTD" : "e.g. 30"}
              value={validDays}
              onChange={(e) => setValidDays(e.target.value)}
              disabled={selectedPlan === "LTD"}
              className={`w-full px-3 py-2.5 rounded-xl border text-xs focus:outline-none focus:border-amber-500 ${
                selectedPlan === "LTD" 
                  ? "bg-slate-900/50 border-slate-800 text-slate-600 cursor-not-allowed" 
                  : "bg-slate-900 border-slate-700 text-white"
              }`}
            />
          </div>
          <div className="md:col-span-4 flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              disabled={generating}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>{generating ? "Generating..." : "Generate Key"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#0c101c] p-4 rounded-3xl border border-white/10 shadow-lg">
        <div className="flex bg-slate-900 p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("UNUSED")}
            className={`flex-1 sm:px-8 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "UNUSED" ? "bg-amber-500 text-slate-950 shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            Available Vault
          </button>
          <button
            onClick={() => setActiveTab("USED")}
            className={`flex-1 sm:px-8 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "USED" ? "bg-amber-500 text-slate-950 shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            Used Keys (Max 100)
          </button>
        </div>
        
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search keys or emails..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Keys Table */}
      <div className="rounded-3xl bg-[#0c101c] border border-white/10 overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm">Loading vault...</div>
        ) : filteredLicenses.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">No keys found in this section.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-6">License Key Code</th>
                  <th className="py-3 px-6">Plan</th>
                  <th className="py-3 px-6">Restrictions</th>
                  <th className="py-3 px-6">Usage Data</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {filteredLicenses.map((l) => (
                  <tr key={l.id} className={`transition-colors ${l.isPinned ? "bg-amber-500/5 hover:bg-amber-500/10" : "hover:bg-slate-900/40"}`}>
                    <td className="py-4 px-6 flex items-center gap-3">
                      <button 
                        onClick={() => handleTogglePin(l.id, l.isPinned)}
                        className={`p-1 rounded-md transition-colors ${l.isPinned ? "text-amber-400 bg-amber-400/10" : "text-slate-600 hover:bg-slate-800 hover:text-slate-400"}`}
                        title={l.isPinned ? "Unpin key" : "Pin key"}
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-mono font-bold text-amber-300 bg-amber-500/10 px-2 py-1 rounded select-all">
                        {l.code}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                        l.plan === "LTD" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                      }`}>
                        {l.plan}
                      </span>
                    </td>
                    <td className="py-4 px-6 space-y-1">
                      {l.lockedToEmail ? (
                        <div className="text-[10px] font-bold text-rose-400">Locked: {l.lockedToEmail}</div>
                      ) : (
                        <div className="text-[10px] text-slate-500">Any Email</div>
                      )}
                      {l.expiresAt ? (
                        <div className="text-[10px] font-bold text-orange-400">Exp: {new Date(l.expiresAt).toLocaleDateString()}</div>
                      ) : (
                        <div className="text-[10px] text-slate-500">No Expiry</div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {l.isUsed ? (
                        <div className="space-y-1">
                          <span className="text-emerald-400 font-bold text-[10px]">REDEEMED</span>
                          <div className="text-[10px] font-mono text-slate-400">{l.usedByEmail}</div>
                          <div className="text-[9px] text-slate-500">{new Date(l.redeemedAt!).toLocaleDateString()}</div>
                        </div>
                      ) : (
                        <span className="text-slate-500 font-bold text-[10px]">UNUSED</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="inline-flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleCopy(l.id, l.code)}
                          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                          title="Copy Key Code"
                        >
                          {copiedId === l.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDelete(l.id)}
                          className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                          title="Delete Key"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
