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

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, planStatus: nextStatus }),
      });
      if (res.ok) {
        setActionStatus(`User status changed to ${nextStatus}!`);
        setTimeout(() => setActionStatus(null), 3000);
        fetchUsers();
      }
    } catch {
      alert("Failed to toggle status");
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
            User Database Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            View customer details, upgrade accounts to LTD, and manage access privileges.
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
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {users.map((u) => (
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
                        <option value="TRIAL">TRIAL (7 Days)</option>
                        <option value="PRO">PRO ($9/mo)</option>
                        <option value="LTD">LTD ($39 Lifetime)</option>
                      </select>
                    </td>

                    <td className="py-4 px-6 font-mono text-slate-300 text-[11px]">
                      {u._count.keywords} kw &bull; {u._count.leads} leads &bull; {u._count.channels} ch
                    </td>

                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleToggleStatus(u.id, u.planStatus)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all ${
                          u.planStatus === "ACTIVE"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20"
                        }`}
                      >
                        {u.planStatus}
                      </button>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete customer account"
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
    </div>
  );
}
