"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Flame,
  ExternalLink,
  Sparkles,
  Copy,
  Check,
  Bookmark,
  X,
  MessageSquare,
  CheckCircle2,
  Filter,
} from "lucide-react";

interface Lead {
  id: string;
  platform: string;
  title: string;
  content: string;
  author: string;
  url: string;
  sourceSubreddit?: string | null;
  intentScore: string;
  status: string;
  pitchDraft?: string | null;
  detectedAt: string;
  keyword: { phrase: string };
}

interface PitchOption {
  style: string;
  text: string;
  recommendedAngle: string;
}

export default function LeadsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500 text-sm">Loading leads feed...</div>}>
      <LeadsContent />
    </Suspense>
  );
}

function LeadsContent() {
  const searchParams = useSearchParams();
  const highlightId = searchParams.get("highlight");

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterPlatform, setFilterPlatform] = useState("ALL");
  const [filterIntent, setFilterIntent] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");

  // Pitch modal / drawer state
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [pitches, setPitches] = useState<PitchOption[]>([]);
  const [pitchLoading, setPitchLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const fetchLeads = async () => {
    try {
      const params = new URLSearchParams();
      if (filterPlatform !== "ALL") params.set("platform", filterPlatform);
      if (filterIntent !== "ALL") params.set("intentScore", filterIntent);
      if (filterStatus !== "ALL") params.set("status", filterStatus);

      const res = await fetch(`/api/leads?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setLeads(data.leads || []);
      }
    } catch {
      console.error("Failed to fetch leads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [filterPlatform, filterIntent, filterStatus]);

  useEffect(() => {
    if (highlightId && leads.length > 0) {
      const target = leads.find((l) => l.id === highlightId);
      if (target) {
        handleOpenPitchStation(target);
      }
    }
  }, [highlightId, leads]);

  const handleUpdateStatus = async (leadId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: leadId, status: newStatus }),
      });
      if (res.ok) {
        setLeads((prev) =>
          prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
        );
      }
    } catch {
      alert("Failed to update lead status");
    }
  };

  const handleOpenPitchStation = async (lead: Lead) => {
    setSelectedLead(lead);
    setPitchLoading(true);

    try {
      const res = await fetch("/api/leads/pitch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: lead.id }),
      });
      const data = await res.json();
      if (res.ok && data.pitches) {
        setPitches(data.pitches);
      }
    } catch {
      console.error("Failed to generate AI pitch");
    } finally {
      setPitchLoading(false);
    }
  };

  const handleCopyPitch = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);

    // Also mark lead as Pitched if it was NEW
    if (selectedLead && selectedLead.status === "NEW") {
      handleUpdateStatus(selectedLead.id, "PITCHED");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Flame className="w-6 h-6 text-amber-400" />
            Leads Feed & AI Pitch Station
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time feed of potential buyers asking for solutions on Reddit and X.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#0c1322] border border-white/5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
          <Filter className="w-4 h-4 text-indigo-400" />
          <span>Filters:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Platform Filter */}
          <select
            value={filterPlatform}
            onChange={(e) => setFilterPlatform(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Platforms</option>
            <option value="REDDIT">Reddit Only</option>
            <option value="TWITTER">X (Twitter) Only</option>
          </select>

          {/* Intent Filter */}
          <select
            value={filterIntent}
            onChange={(e) => setFilterIntent(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Intent Scores</option>
            <option value="HIGH">🔥 High Intent Only</option>
            <option value="MEDIUM">⚡ Medium Intent</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="NEW">New Leads</option>
            <option value="PITCHED">Already Pitched</option>
            <option value="SAVED">Saved</option>
            <option value="DISMISSED">Dismissed</option>
          </select>
        </div>
      </div>

      {/* Leads List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-16 text-center text-slate-500 text-sm">
            Fetching real-time buyer leads...
          </div>
        ) : leads.length === 0 ? (
          <div className="p-16 text-center rounded-2xl bg-[#0c1322] border border-white/5 space-y-3">
            <div className="h-12 w-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
              <Flame className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-white">No matching leads found</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try adjusting your filters, or click "Scan Radar Now" in the top bar to run a live scan across Reddit and Twitter.
            </p>
          </div>
        ) : (
          leads.map((lead) => (
            <div
              key={lead.id}
              className={`p-3.5 sm:p-6 rounded-xl sm:rounded-2xl bg-[#0c1322] border transition-all ${
                lead.status === "PITCHED"
                  ? "border-emerald-500/20 bg-[#0c1322]/60"
                  : lead.status === "DISMISSED"
                  ? "border-slate-800 opacity-60"
                  : "border-white/5 hover:border-indigo-500/30"
              }`}
            >
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-800/60">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded-md ${
                      lead.platform === "REDDIT"
                        ? "bg-[#ff4500]/10 text-[#ff4500] border border-[#ff4500]/20"
                        : "bg-[#1da1f2]/10 text-[#1da1f2] border border-[#1da1f2]/20"
                    }`}
                  >
                    {lead.platform} {lead.sourceSubreddit ? `• r/${lead.sourceSubreddit}` : ""}
                  </span>

                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-md ${
                      lead.intentScore === "HIGH"
                        ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    }`}
                  >
                    {lead.intentScore === "HIGH" ? "🔥 High Intent" : "⚡ Medium Intent"}
                  </span>

                  <span className="text-xs text-slate-400 font-mono">
                    Keyword: <span className="text-indigo-300">"{lead.keyword.phrase}"</span>
                  </span>

                  <span className="text-xs text-slate-500">
                    by <span className="text-slate-300 font-medium">{lead.author}</span>
                  </span>
                </div>

                {/* Status Pill */}
                <span
                  className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                    lead.status === "PITCHED"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : lead.status === "SAVED"
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      : lead.status === "DISMISSED"
                      ? "bg-slate-800 text-slate-500"
                      : "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                  }`}
                >
                  {lead.status}
                </span>
              </div>

              {/* Body */}
              <div className="py-4 space-y-2">
                <h3 className="text-base font-bold text-white hover:text-indigo-300 transition-colors">
                  <a href={lead.url} target="_blank" rel="noopener noreferrer">
                    {lead.title}
                  </a>
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  "{lead.content}"
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenPitchStation(lead)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>AI Pitch Drafter</span>
                  </button>

                  <a
                    href={lead.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center gap-1.5"
                  >
                    <span>Open on {lead.platform === "REDDIT" ? "Reddit" : "X"}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="flex items-center gap-2">
                  {lead.status !== "PITCHED" && (
                    <button
                      onClick={() => handleUpdateStatus(lead.id, "PITCHED")}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors flex items-center gap-1"
                      title="Mark as pitched"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Pitched</span>
                    </button>
                  )}

                  {lead.status !== "SAVED" && (
                    <button
                      onClick={() => handleUpdateStatus(lead.id, "SAVED")}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors flex items-center gap-1"
                      title="Save lead for later"
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>Save</span>
                    </button>
                  )}

                  {lead.status !== "DISMISSED" && (
                    <button
                      onClick={() => handleUpdateStatus(lead.id, "DISMISSED")}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Dismiss lead"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pitch Drawer / Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-[#0e1627] border border-white/10 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    AI Sales Pitch Drafter
                  </h3>
                  <p className="text-xs text-slate-400">
                    Tailored, value-driven reply for u/{selectedLead.author}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Original Post Context */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1 text-xs">
              <span className="font-semibold text-slate-400 uppercase text-[10px]">Original Query:</span>
              <p className="font-medium text-white">"{selectedLead.title}"</p>
            </div>

            {/* Pitches List */}
            {pitchLoading ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                Generating high-converting pitches...
              </div>
            ) : pitches.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                Could not load pitches.
              </div>
            ) : (
              <div className="space-y-4">
                {pitches.map((p, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 transition-colors space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-300">
                        {p.style}
                      </span>
                      <button
                        onClick={() => handleCopyPitch(p.text, idx)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                      >
                        {copiedIndex === idx ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-300" />
                            <span>Copied to Clipboard!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Pitch</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-400 italic">
                      {p.recommendedAngle}
                    </p>

                    <div className="p-3 rounded-lg bg-black/40 border border-white/5 text-xs text-slate-200 font-mono whitespace-pre-wrap leading-relaxed">
                      {p.text}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <a
                href={selectedLead.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-2"
              >
                <span>Open Post to Paste</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={() => setSelectedLead(null)}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
