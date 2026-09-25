"use client";

import { useEffect, useState } from "react";
import { Users, Search, Trash2, ShieldCheck, CheckCircle2, Pin, CalendarPlus, StickyNote, Edit, X, UserX } from "lucide-react";

interface UserItem {
  id: string;
  name: string;
  email: string;
  productName: string;
  productUrl: string;
  plan: string;
  planStatus: string;
  planExpiresAt: string | null;
  notes: string | null;
  isPinned: boolean;
  createdAt: string;
  transactions?: { paymentMethod: string }[];
  _count: {
    keywords: number;
    leads: number;
    channels: number;
  };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionStatus, setActionStatus] = useState<string | null>(null);

  // Tabs
  const [activeTab, setActiveTab] = useState<"ALL" | "PAID" | "KEY">("ALL");

  // Notes Modal State
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [activeNotesUserId, setActiveNotesUserId] = useState<string | null>(null);
  const [activeNotesText, setActiveNotesText] = useState("");
  const [notesSaving, setNotesSaving] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`/api/admin/users?q=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (res.ok && data.users) {
        setUsers(data.users);
      }
    } catch {
      console.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const showStatus = (msg: string) => {
    setActionStatus(msg);
    setTimeout(() => setActionStatus(null), 3000);
  };

  const handleUpdatePlan = async (userId: string, newPlan: string) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, plan: newPlan }),
      });
      if (res.ok) {
        showStatus(`Plan upgraded to ${newPlan}!`);
        fetchUsers();
      }
    } catch {
      alert("Failed to update plan");
    }
  };

  const handleUpdateStatus = async (userId: string, targetStatus: "ACTIVE" | "SUSPENDED") => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, planStatus: targetStatus }),
      });
      if (res.ok) {
        showStatus(`User marked as ${targetStatus === "ACTIVE" ? "ALLOWED / ACTIVE" : "BLOCKED"}!`);
        fetchUsers();
      }
    } catch {
      alert("Failed to update user status");
    }
  };

  const handleRevokeAccess = async (userId: string) => {
    if (!confirm("Are you sure you want to completely revoke access for this user? They will be downgraded to INACTIVE.")) return;
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, plan: "INACTIVE", planStatus: "PENDING_PAYMENT" }),
      });
      if (res.ok) {
        showStatus("User access fully revoked.");
        fetchUsers();
      }
    } catch {
      alert("Failed to revoke access");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to completely delete this user and all their tracked keywords?")) return;
    try {
      const res = await fetch(`/api/admin/users?id=${userId}`, { method: "DELETE" });
      if (res.ok) {
        showStatus("User successfully deleted.");
        fetchUsers();
      }
    } catch {
      alert("Failed to delete user");
    }
  };

  const handleTogglePin = async (userId: string, currentPin: boolean) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, isPinned: !currentPin }),
      });
      if (res.ok) {
        showStatus(!currentPin ? "User Pinned!" : "User Unpinned!");
        fetchUsers();
      }
    } catch {
      alert("Failed to toggle pin");
    }
  };

  const handleAdd30Days = async (userId: string) => {
    if (!confirm("Are you sure you want to add 30 days to this user's plan?")) return;
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, add30Days: true }),
      });
      if (res.ok) {
        showStatus("Added 30 days to plan successfully.");
        fetchUsers();
      }
    } catch {
      alert("Failed to add 30 days");
    }
  };

  const openNotesModal = (user: UserItem) => {
    setActiveNotesUserId(user.id);
    setActiveNotesText(user.notes || "");
    setIsNotesModalOpen(true);
  };

  const saveNotes = async () => {
    if (!activeNotesUserId) return;
    setNotesSaving(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: activeNotesUserId, notes: activeNotesText }),
      });
      if (res.ok) {
        showStatus("Notes updated successfully.");
        setIsNotesModalOpen(false);
        fetchUsers();
      }
    } catch {
      alert("Failed to save notes");
    } finally {
      setNotesSaving(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const paymentMethod = u.transactions?.[0]?.paymentMethod || "UNKNOWN";
    if (activeTab === "PAID") return paymentMethod === "LEMON_SQUEEZY" || paymentMethod === "STRIPE" || paymentMethod === "CARD";
    if (activeTab === "KEY") return paymentMethod === "ADMIN_LICENSE_KEY";
    return true; // ALL
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-400" />
            User Database &amp; Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage customer accounts, plans, notes, and direct access controls.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search email or name..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {actionStatus && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionStatus}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex bg-[#0c101c] p-1 rounded-xl w-full sm:w-max border border-white/10 shadow-lg">
        <button
          onClick={() => setActiveTab("ALL")}
          className={`flex-1 sm:px-6 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === "ALL" ? "bg-amber-500 text-slate-950 shadow-sm" : "text-slate-400 hover:text-white"
          }`}
        >
          All Users
        </button>
        <button
          onClick={() => setActiveTab("PAID")}
          className={`flex-1 sm:px-6 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === "PAID" ? "bg-amber-500 text-slate-950 shadow-sm" : "text-slate-400 hover:text-white"
          }`}
        >
          LemonSqueezy / Paid
        </button>
        <button
          onClick={() => setActiveTab("KEY")}
          className={`flex-1 sm:px-6 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === "KEY" ? "bg-amber-500 text-slate-950 shadow-sm" : "text-slate-400 hover:text-white"
          }`}
        >
          License Key Users
        </button>
      </div>

      {/* Users Table */}
      <div className="rounded-3xl bg-[#0c101c] border border-white/10 overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            Searching user database...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            No users found in this category.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Name / Email</th>
                  <th className="py-3.5 px-6">Product & Notes</th>
                  <th className="py-3.5 px-6">Current Plan</th>
                  <th className="py-3.5 px-6">Origin</th>
                  <th className="py-3.5 px-6 text-right">Access Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {filteredUsers.map((u) => {
                  const isBlocked = u.planStatus === "SUSPENDED";
                  const paymentMethod = u.transactions?.[0]?.paymentMethod || "UNKNOWN";
                  
                  return (
                    <tr key={u.id} className={`transition-colors ${u.isPinned ? "bg-amber-500/5 hover:bg-amber-500/10" : "hover:bg-slate-900/40"}`}>
                      <td className="py-4 px-6 flex items-start gap-3">
                        <button 
                          onClick={() => handleTogglePin(u.id, u.isPinned)}
                          className={`mt-0.5 p-1 rounded-md transition-colors ${u.isPinned ? "text-amber-400 bg-amber-400/10" : "text-slate-600 hover:bg-slate-800 hover:text-slate-400"}`}
                          title={u.isPinned ? "Unpin user" : "Pin user to top"}
                        >
                          <Pin className="w-3.5 h-3.5" />
                        </button>
                        <div>
                          <span className="font-bold text-white block">{u.name || "Founder"}</span>
                          <span className="font-mono text-slate-400 text-[11px]">{u.email}</span>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span className="font-semibold text-slate-300 block">{u.productName || "None"}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] text-slate-500 truncate max-w-[120px]">{u.productUrl}</span>
                          <button onClick={() => openNotesModal(u)} className="p-1 rounded bg-slate-800/50 hover:bg-slate-700 text-slate-400 transition-colors flex items-center gap-1" title="Edit Notes">
                            <Edit className="w-3 h-3" />
                            {u.notes ? <span className="text-[9px] font-bold text-amber-500">Note</span> : null}
                          </button>
                        </div>
                      </td>

                      <td className="py-4 px-6 space-y-2">
                        <div className="flex items-center gap-2">
                          <select
                            value={u.plan}
                            onChange={(e) => handleUpdatePlan(u.id, e.target.value)}
                            className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
                          >
                            <option value="INACTIVE">INACTIVE</option>
                            <option value="PRO">PRO</option>
                            <option value="LTD">LTD</option>
                          </select>
                          
                          <button onClick={() => handleAdd30Days(u.id)} className="p-1 rounded bg-slate-800 hover:bg-emerald-500/20 text-emerald-400 border border-transparent hover:border-emerald-500/30 transition-colors flex items-center gap-1" title="Add +30 Days">
                            <CalendarPlus className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold">+30D</span>
                          </button>
                        </div>
                        {u.planExpiresAt && (
                           <div className="text-[10px] text-slate-500">Exp: {new Date(u.planExpiresAt).toLocaleDateString()}</div>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        {paymentMethod === "LEMON_SQUEEZY" || paymentMethod === "STRIPE" || paymentMethod === "CARD" ? (
                           <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 font-bold text-[10px] border border-emerald-500/20">PAID SUBSCRIPTION</span>
                        ) : paymentMethod === "ADMIN_LICENSE_KEY" ? (
                           <span className="px-2 py-1 rounded bg-blue-500/10 text-blue-400 font-bold text-[10px] border border-blue-500/20">LICENSE KEY</span>
                        ) : (
                           <span className="px-2 py-1 rounded bg-slate-800 text-slate-400 font-bold text-[10px]">UNKNOWN</span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-right space-y-2">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleRevokeAccess(u.id)}
                            className="px-2 py-1.5 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 font-bold text-[10px] transition-all flex items-center gap-1"
                            title="1-Click Revoke Access (Sets to INACTIVE)"
                          >
                            <UserX className="w-3 h-3" />
                            Revoke
                          </button>
                          
                          {isBlocked ? (
                            <button
                              onClick={() => handleUpdateStatus(u.id, "ACTIVE")}
                              className="px-2 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 font-bold text-[10px] transition-all"
                            >
                              Unblock
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUpdateStatus(u.id, "SUSPENDED")}
                              className="px-2 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 font-bold text-[10px] transition-all"
                            >
                              Block
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors border border-transparent hover:border-rose-500/30"
                            title="Delete Account completely"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Notes Modal */}
      {isNotesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0b0f19] border border-slate-800 p-6 rounded-3xl shadow-2xl w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <StickyNote className="w-5 h-5 text-amber-500" />
                User Internal Notes
              </h3>
              <button onClick={() => setIsNotesModalOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <textarea
              className="w-full h-32 bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-slate-300 focus:outline-none focus:border-amber-500 resize-none"
              placeholder="Write internal admin notes here..."
              value={activeNotesText}
              onChange={(e) => setActiveNotesText(e.target.value)}
            />
            <div className="flex justify-end mt-4">
              <button
                onClick={saveNotes}
                disabled={notesSaving}
                className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl transition-all"
              >
                {notesSaving ? "Saving..." : "Save Notes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
