"use client";

import { useEffect, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import Sidebar from "@/components/Sidebar";
import { dashboardAPI, ordersAPI, Order } from "@/lib/api";
import Link from "next/link";

interface Stats {
  today_sales: number;
  month_sales: number;
  today_orders: number;
  active_items: number;
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([dashboardAPI.stats(), ordersAPI.list()])
      .then(([statsRes, ordersRes]) => {
        setStats(statsRes.data);
        setRecentOrders(ordersRes.data.slice(0, 5));
      })
      .finally(() => setLoading(false));
  }, []);

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-AE", { style: "currency", currency: "AED" }).format(n);

  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto px-6 py-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-xl font-bold text-gray-900 mb-6">Dashboard</h1>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Today's Sales" value={fmt(stats?.today_sales ?? 0)} />
                <StatCard label="Month Sales" value={fmt(stats?.month_sales ?? 0)} />
                <StatCard label="Orders Today" value={stats?.today_orders ?? 0} />
                <StatCard label="Active Items" value={stats?.active_items ?? 0} />
              </div>
            )}

            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-900">Recent Orders</h2>
                <Link href="/orders" className="text-sm text-blue-600 hover:underline">
                  View all
                </Link>
              </div>

              {recentOrders.length === 0 && !loading ? (
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
                  <p className="text-4xl mb-2">◎</p>
                  <p className="text-sm">No orders yet.</p>
                  <Link
                    href="/orders/new"
                    className="mt-3 inline-block text-sm text-blue-600 hover:underline"
                  >
                    Create your first order
                  </Link>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        {["Customer", "Total", "Payment", "Date"].map((h) => (
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
                      {recentOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium">{order.customer_name}</td>
                          <td className="px-4 py-3">{fmt(parseFloat(order.total_amount))}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                                order.payment_status === "paid"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {order.payment_status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-400">
                            {new Date(order.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="mt-6">
              <Link
                href="/orders/new"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition"
              >
                <span className="text-lg">＋</span> New Order
              </Link>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
