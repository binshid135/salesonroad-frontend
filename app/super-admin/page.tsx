"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SuperAdminGuard from "@/components/SuperAdminGuard";
import SuperAdminSidebar from "@/components/SuperAdminSidebar";
import { superAdminAPI, SuperAdminStats } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const TIER_COLORS: Record<string, string> = {
  free: "bg-gray-100 text-gray-600",
  starter: "bg-blue-100 text-blue-700",
  pro: "bg-violet-100 text-violet-700",
  enterprise: "bg-amber-100 text-amber-700",
};

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className={`rounded-xl border p-5 ${accent || "bg-white border-gray-200"}`}>
      <p className="text-xs font-medium uppercase tracking-wide opacity-60">{label}</p>
      <p className="text-3xl font-bold mt-1">{value}</p>
      {sub && <p className="text-xs opacity-50 mt-1">{sub}</p>}
    </div>
  );
}

export default function SuperAdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<SuperAdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || user?.role !== "super_admin") return;

    superAdminAPI.stats().then((r) => {
      setStats(r.data);
      setLoading(false);
    });
  }, [authLoading, user]);

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

  const tierOrder = ["free", "starter", "pro", "enterprise"];

  return (
    <SuperAdminGuard>
      <div className="flex min-h-screen bg-gray-50 md:h-screen md:overflow-hidden">
        <SuperAdminSidebar />
        <main className="flex-1 overflow-y-auto bg-gray-50 px-3 py-4 pb-24 sm:px-6 sm:py-6 md:pb-6">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-xl font-bold text-gray-900 mb-6">Platform Overview</h1>

            {loading ? (
              <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 md:grid-cols-4 md:gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-28 bg-gray-200 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <>
                {/* KPI row */}
                <div className="mb-6 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 md:grid-cols-3 md:gap-4">
                  <StatCard
                    label="Monthly Recurring Revenue"
                    value={fmt(stats?.mrr ?? 0)}
                    sub="Based on active paid plans"
                    accent="bg-violet-600 border-violet-600 text-white"
                  />
                  <StatCard
                    label="Total Organizations"
                    value={stats?.total_organizations ?? 0}
                    sub={`${stats?.active_organizations ?? 0} active`}
                  />
                  <StatCard
                    label="Total Users"
                    value={stats?.total_users ?? 0}
                  />
                  <StatCard
                    label="Total Orders"
                    value={stats?.total_orders ?? 0}
                    sub={`${stats?.orders_this_month ?? 0} this month`}
                  />
                </div>

                {/* Tier breakdown */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
                  <h2 className="text-sm font-semibold text-gray-700 mb-4">Subscription Breakdown</h2>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {tierOrder.map((tier) => {
                      const count = stats?.tier_breakdown[tier] ?? 0;
                      const total = stats?.total_organizations || 1;
                      const pct = Math.round((count / total) * 100);
                      return (
                        <div key={tier} className="text-center">
                          <div className="text-2xl font-bold text-gray-900">{count}</div>
                          <div className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${TIER_COLORS[tier]}`}>
                            {tier}
                          </div>
                          <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-violet-500 rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-400 mt-1">{pct}%</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Recent signups */}
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <h2 className="text-sm font-semibold text-gray-700">Recent Signups</h2>
                    <Link
                      href="/super-admin/organizations"
                      className="text-xs text-violet-600 hover:underline"
                    >
                      View all →
                    </Link>
                  </div>
                  <div className="overflow-x-auto">
                  <table className="min-w-[48rem] text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        {["Company", "Subdomain", "Plan", "Status", "Joined"].map((h) => (
                          <th
                            key={h}
                            className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {(stats?.recent_signups ?? []).map((org) => (
                        <tr key={org.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium">{org.name}</td>
                          <td className="px-4 py-3 text-gray-400 font-mono text-xs">
                            {org.subdomain}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TIER_COLORS[org.subscription_tier]}`}>
                              {org.subscription_tier}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              org.subscription_status === "active"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-600"
                            }`}>
                              {org.subscription_status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-400 text-xs">
                            {new Date(org.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </SuperAdminGuard>
  );
}
