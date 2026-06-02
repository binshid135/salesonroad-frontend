"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SuperAdminGuard from "@/components/SuperAdminGuard";
import SuperAdminSidebar from "@/components/SuperAdminSidebar";
import { superAdminAPI, OrgRow } from "@/lib/api";

const TIER_COLORS: Record<string, string> = {
  free: "bg-gray-100 text-gray-600",
  starter: "bg-blue-100 text-blue-700",
  pro: "bg-violet-100 text-violet-700",
  enterprise: "bg-amber-100 text-amber-700",
};

export default function OrganizationsPage() {
  const [orgs, setOrgs] = useState<OrgRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchOrgs = (s = search, t = tierFilter, st = statusFilter) => {
    setLoading(true);
    superAdminAPI
      .organizations({ search: s || undefined, tier: t || undefined, status: st || undefined })
      .then((r) => setOrgs(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrgs();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchOrgs(), 400);
    return () => clearTimeout(timer);
  }, [search, tierFilter, statusFilter]);

  return (
    <SuperAdminGuard>
      <div className="flex h-screen overflow-hidden">
        <SuperAdminSidebar />
        <main className="flex-1 overflow-y-auto px-6 py-6 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-xl font-bold text-gray-900 mb-6">Organizations</h1>

            {/* Filters */}
            <div className="flex gap-3 mb-5 flex-wrap">
              <input
                type="search"
                placeholder="Search name or subdomain…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 min-w-48 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
              />
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
              >
                <option value="">All plans</option>
                {["free", "starter", "pro", "enterprise"].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
              >
                <option value="">All statuses</option>
                {["active", "suspended", "cancelled"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <p className="text-xs text-gray-400 mb-3">{orgs.length} organizations</p>

            {loading ? (
              <div className="space-y-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-14 bg-gray-200 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {["Company", "Subdomain", "Plan", "Status", "Users", "Orders", "Joined", ""].map((h) => (
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
                    {orgs.map((org) => (
                      <tr key={org.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{org.name}</td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-400">{org.subdomain}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TIER_COLORS[org.subscription_tier]}`}>
                            {org.subscription_tier}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            org.subscription_status === "active"
                              ? "bg-green-100 text-green-700"
                              : org.subscription_status === "suspended"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-red-100 text-red-600"
                          }`}>
                            {org.subscription_status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{org.user_count}</td>
                        <td className="px-4 py-3 text-gray-600">{org.order_count}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs">
                          {new Date(org.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/super-admin/organizations/${org.id}`}
                            className="text-violet-600 hover:underline text-xs font-medium"
                          >
                            View →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {orgs.length === 0 && (
                  <div className="py-12 text-center text-gray-400 text-sm">
                    No organizations match your filters.
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </SuperAdminGuard>
  );
}
