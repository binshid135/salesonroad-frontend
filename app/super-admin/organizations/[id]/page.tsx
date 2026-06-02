"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import SuperAdminGuard from "@/components/SuperAdminGuard";
import SuperAdminSidebar from "@/components/SuperAdminSidebar";
import { superAdminAPI } from "@/lib/api";

interface OrgDetail {
  organization: {
    id: string;
    name: string;
    subdomain: string;
    subscription_tier: string;
    subscription_status: string;
    stripe_customer_id: string | null;
    stripe_subscription_id: string | null;
    current_period_end: string | null;
    created_at: string;
  };
  users: {
    id: string;
    email: string;
    full_name: string;
    role: string;
    is_active: boolean;
    last_login: string | null;
  }[];
  stats: {
    total_orders: number;
    total_revenue: number;
    month_orders: number;
    month_revenue: number;
    active_items: number;
  };
}

const TIER_COLORS: Record<string, string> = {
  free: "bg-gray-100 text-gray-600",
  starter: "bg-blue-100 text-blue-700",
  pro: "bg-violet-100 text-violet-700",
  enterprise: "bg-amber-100 text-amber-700",
};

export default function OrgDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<OrgDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const load = () => {
    setLoading(true);
    superAdminAPI.orgDetail(id).then((r) => {
      setData(r.data);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, [id]);

  const update = async (patch: Record<string, string>) => {
    setSaving(true);
    setMsg("");
    try {
      await superAdminAPI.updateOrg(id, patch);
      setMsg("Updated successfully.");
      load();
    } catch {
      setMsg("Failed to update.");
    } finally {
      setSaving(false);
    }
  };

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-AE", { style: "currency", currency: "AED" }).format(n);

  if (loading) {
    return (
      <SuperAdminGuard>
        <div className="flex h-screen overflow-hidden">
          <SuperAdminSidebar />
          <main className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
          </main>
        </div>
      </SuperAdminGuard>
    );
  }

  if (!data) return null;
  const org = data.organization;

  return (
    <SuperAdminGuard>
      <div className="flex h-screen overflow-hidden">
        <SuperAdminSidebar />
        <main className="flex-1 overflow-y-auto px-6 py-6 bg-gray-50">
          <div className="max-w-4xl mx-auto">

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <Link
                href="/super-admin/organizations"
                className="text-sm text-gray-400 hover:text-gray-700"
              >
                ← Organizations
              </Link>
            </div>

            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{org.name}</h1>
                <p className="text-sm text-gray-400 font-mono mt-0.5">{org.subdomain}.salesonroad.com</p>
              </div>
              <div className="flex gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${TIER_COLORS[org.subscription_tier]}`}>
                  {org.subscription_tier}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  org.subscription_status === "active"
                    ? "bg-green-100 text-green-700"
                    : org.subscription_status === "suspended"
                    ? "bg-orange-100 text-orange-700"
                    : "bg-red-100 text-red-600"
                }`}>
                  {org.subscription_status}
                </span>
              </div>
            </div>

            {msg && (
              <div className={`mb-4 text-sm px-4 py-3 rounded-lg ${
                msg.includes("Failed") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
              }`}>
                {msg}
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: "Total Orders", value: data.stats.total_orders },
                { label: "Total Revenue", value: fmt(data.stats.total_revenue) },
                { label: "This Month Orders", value: data.stats.month_orders },
                { label: "Active Items", value: data.stats.active_items },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white rounded-xl border border-gray-200 p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">Actions</h2>
              <div className="flex flex-wrap gap-3">
                {/* Change tier */}
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Change plan:</label>
                  <select
                    className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    defaultValue={org.subscription_tier}
                    onChange={(e) => update({ subscription_tier: e.target.value })}
                    disabled={saving}
                  >
                    {["free", "starter", "pro", "enterprise"].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                {/* Suspend / Activate */}
                {org.subscription_status === "active" ? (
                  <button
                    onClick={() => {
                      if (confirm(`Suspend ${org.name}? They will lose access.`))
                        update({ subscription_status: "suspended" });
                    }}
                    disabled={saving}
                    className="px-4 py-1.5 bg-orange-100 text-orange-700 hover:bg-orange-200 rounded-lg text-sm font-medium transition disabled:opacity-60"
                  >
                    Suspend
                  </button>
                ) : (
                  <button
                    onClick={() => update({ subscription_status: "active" })}
                    disabled={saving}
                    className="px-4 py-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg text-sm font-medium transition disabled:opacity-60"
                  >
                    Activate
                  </button>
                )}
              </div>
            </div>

            {/* Stripe Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Stripe</h2>
              <div className="space-y-2 text-sm">
                <div className="flex gap-3">
                  <span className="text-gray-500 w-40 shrink-0">Customer ID</span>
                  <span className="font-mono text-gray-700">{org.stripe_customer_id || "—"}</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-gray-500 w-40 shrink-0">Subscription ID</span>
                  <span className="font-mono text-gray-700">{org.stripe_subscription_id || "—"}</span>
                </div>
                <div className="flex gap-3">
                  <span className="text-gray-500 w-40 shrink-0">Period ends</span>
                  <span className="text-gray-700">
                    {org.current_period_end
                      ? new Date(org.current_period_end).toLocaleDateString()
                      : "—"}
                  </span>
                </div>
                <div className="flex gap-3">
                  <span className="text-gray-500 w-40 shrink-0">Member since</span>
                  <span className="text-gray-700">{new Date(org.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Users */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-700">
                  Users ({data.users.length})
                </h2>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {["Name", "Email", "Role", "Status", "Last login"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{u.full_name || "—"}</td>
                      <td className="px-4 py-3 text-gray-500">{u.email}</td>
                      <td className="px-4 py-3 capitalize text-gray-500">{u.role.replace("_", " ")}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          u.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                        }`}>
                          {u.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {u.last_login ? new Date(u.last_login).toLocaleDateString() : "Never"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </main>
      </div>
    </SuperAdminGuard>
  );
}
