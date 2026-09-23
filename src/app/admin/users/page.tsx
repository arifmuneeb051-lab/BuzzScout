"use client";

import { useEffect, useState } from "react";
import { Users, Search, Trash2, ShieldCheck, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";

interface UserItem {
  id: string;
  name: string;
  email: string;
  productName: string;
  productUrl: string;
  plan: string;
  planStatus: string;
  createdAt: string;
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
  const [grantEmail, setGrantEmail] = useState("");
  const [grantPlan, setGrantPlan] = useState("LTD");
  const [grantName, setGrantName] = useState("");
  const [grantLoading, setGrantLoading] = useState(false);

  const handleGrantAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grantEmail) return;
    setGrantLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: grantEmail,
          plan: grantPlan,
          name: grantName,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setActionStatus(data.message || `Granted ${grantPlan} access to ${grantEmail}!`);
        setGrantEmail("");
        setGrantName("");
        setTimeout(() => setActionStatus(null), 4000);
        fetchUsers();
      } else {
        alert(data.error || "Failed to grant package access");
      }
    } catch {
      alert("Network error granting package access");
    } finally {
      setGrantLoading(false);
    }
  };

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

  const handleUpdatePlan = async (userId: string, newPlan: string) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, plan: newPlan }),
      });
      if (res.ok) {
        setActionStatus(`Plan upgraded to ${newPlan}!`);
        setTimeout(() => setActionStatus(null), 3000);
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
        setActionStatus(`User marked as ${targetStatus === "ACTIVE" ? "ALLOWED / ACTIVE" : "BLOCKED"}!`);
        setTimeout(() => setActionStatus(null), 3000);
        fetchUsers();
      }
    } catch {
      alert("Failed to update user status");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to completely delete this user and all their tracked keywords?")) return;
    try {
      const res = await fetch(`/api/admin/users?id=${userId}`, { method: "DELETE" });
      if (res.ok) {
        setActionStatus("User successfully deleted.");
        setTimeout(() => setActionStatus(null), 3000);
        fetchUsers();
      }
    } catch {
      alert("Failed to delete user");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-400" />
            User Database &amp; Access Control
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage customer accounts, assign plans, and 1-click Block or Unblock user access.
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

      {/* Direct Package Provisioning Form */}
      <div className="rounded-2xl bg-[#0c1220] border border-amber-500/20 p-5 shadow-xl">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-extrabold text-white">Direct Package Provisioning (Manual Access Grant)</h3>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Assign any package to an existing or new customer directly without payment. If the account does not exist, it will be automatically created with full access.
        </p>
        <form onSubmit={handleGrantAccess} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <input
            type="email"
            required
            value={grantEmail}
            onChange={(e) => setGrantEmail(e.target.value)}
            placeholder="User email (e.g. founder@company.com)"
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500 sm:col-span-2"
          />
          <select
            value={grantPlan}
            onChange={(e) => setGrantPlan(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
          >
            <option value="PRO">PRO ($5/mo Monthly)</option>
            <option value="LTD">LTD ($25 Lifetime Pass)</option>
            <option value="INACTIVE">INACTIVE (Revoke Access)</option>
          </select>
          <button
            type="submit"
            disabled={grantLoading || !grantEmail}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs transition-all shadow-md shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{grantLoading ? "Granting..." : "Grant Access Now"}</span>
          </button>
        </form>
      </div>

      {/* Users Table */}
      <div className="rounded-3xl bg-[#0c101c] border border-white/10 overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            Searching user database...
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            No users found matching query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Name / Email</th>
                  <th className="py-3.5 px-6">Product Tracked</th>
                  <th className="py-3.5 px-6">Current Plan</th>
                  <th className="py-3.5 px-6">Activity</th>
                  <th className="py-3.5 px-6">Access Status</th>
                  <th className="py-3.5 px-6 text-right">Block / Unblock &amp; Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {users.map((u) => {
                  const isBlocked = u.planStatus === "SUSPENDED";
                  return (
                    <tr key={u.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-4 px-6">
                        <span className="font-bold text-white block">{u.name || "Founder"}</span>
                        <span className="font-mono text-slate-400 text-[11px]">{u.email}</span>
                      </td>

                      <td className="py-4 px-6">
                        <span className="font-semibold text-slate-300 block">{u.productName || "None"}</span>
                        <span className="text-[11px] text-slate-500 truncate block max-w-[150px]">{u.productUrl}</span>
                      </td>

                      <td className="py-4 px-6">
                        <select
                          value={u.plan}
                          onChange={(e) => handleUpdatePlan(u.id, e.target.value)}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
                        >
                          <option value="INACTIVE">INACTIVE (Pending Payment)</option>
                          <option value="PRO">PRO ($5/mo)</option>
                          <option value="LTD">LTD ($25 Lifetime)</option>
                        </select>
                      </td>

                      <td className="py-4 px-6 font-mono text-slate-300 text-[11px]">
                        {u._count.keywords} kw &bull; {u._count.leads} leads &bull; {u._count.channels} ch
                      </td>

                      <td className="py-4 px-6">
                        {isBlocked ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[11px] font-extrabold tracking-wide">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
                            🔴 BLOCKED
                          </span>
                        ) : u.planStatus === "ACTIVE" ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-extrabold tracking-wide">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            🟢 ACTIVE
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-extrabold tracking-wide">
                            🟡 PENDING
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="inline-flex items-center justify-end gap-2">
                          {isBlocked ? (
                            <button
                              onClick={() => handleUpdateStatus(u.id, "ACTIVE")}
                              className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 font-extrabold text-xs transition-all flex items-center gap-1.5 shadow-sm"
                              title="Restore account access"
                            >
                              <span>✅ Unblock User</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUpdateStatus(u.id, "SUSPENDED")}
                              className="px-3 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 font-extrabold text-xs transition-all flex items-center gap-1.5 shadow-sm"
                              title="Revoke access & block user login"
                            >
                              <span>🚫 Block User</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Delete customer account completely"
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
    </div>
  );
}
