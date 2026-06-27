"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell, Card, EmptyState, PageHeader, PlusIcon, StatusBadge } from "@/components/AppShell";
import { useAuth } from "@/context/AuthContext";
import { dashboardAPI, ordersAPI, Order } from "@/lib/api";

interface Stats {
  today_sales: number;
  month_sales: number;
  today_orders: number;
  active_items: number;
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="p-4 sm:p-5">
      <p className="text-xs font-bold uppercase tracking-wide text-[#6d6478]">{label}</p>
      <p className="mt-2 break-words text-2xl font-black text-[#130824] sm:text-3xl">{value}</p>
    </Card>
  );
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user) return;

    if (user.role === "super_admin") {
      router.replace("/super-admin");
      return;
    }

    Promise.all([dashboardAPI.stats(), ordersAPI.list()])
      .then(([statsRes, ordersRes]) => {
        setStats(statsRes.data);
        setRecentOrders(ordersRes.data.slice(0, 5));
      })
      .finally(() => setLoading(false));
  }, [authLoading, user, router]);

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-AE", { style: "currency", currency: "AED" }).format(n);

  return (
    <AppShell>
      <PageHeader
        title="Dashboard"
        subtitle={`Welcome back${user?.full_name ? `, ${user.full_name}` : ""}. Track today, this month, and your latest field orders.`}
        actions={
          <Link
            href="/orders/new"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#6d28d9] px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-purple-900/15 transition hover:bg-[#581c87] sm:w-auto"
          >
            <PlusIcon /> New Order
          </Link>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-purple-100/70" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 md:grid-cols-4">
          <StatCard label="Today's Sales" value={fmt(stats?.today_sales ?? 0)} />
          <StatCard label="Month Sales" value={fmt(stats?.month_sales ?? 0)} />
          <StatCard label="Orders Today" value={stats?.today_orders ?? 0} />
          <StatCard label="Active Items" value={stats?.active_items ?? 0} />
        </div>
      )}

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-black text-[#130824]">Recent Orders</h2>
          <Link href="/orders" className="text-sm font-bold text-purple-700 hover:text-purple-900">
            View all
          </Link>
        </div>

        {recentOrders.length === 0 && !loading ? (
          <EmptyState
            title="No orders yet"
            body="Create your first order to start seeing recent activity here."
            action={
              <Link
                href="/orders/new"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-purple-200 bg-white px-4 py-2.5 text-sm font-black text-purple-800 transition hover:bg-purple-50"
              >
                <PlusIcon /> Create order
              </Link>
            }
          />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-white/80 bg-white shadow-[0_16px_40px_rgba(54,22,92,0.08)]">
            <table className="min-w-[42rem] border-collapse text-left text-sm">
              <thead>
                <tr>
                  {["Customer", "Total", "Payment", "Date"].map((heading) => (
                    <th key={heading} className="bg-purple-50 px-4 py-3 text-xs font-black uppercase tracking-wide text-[#6d6478]">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eee7f8]">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-purple-50/50">
                    <td className="px-4 py-3 font-bold text-[#130824]">{order.customer_name}</td>
                    <td className="px-4 py-3 font-semibold text-[#130824]">{fmt(parseFloat(order.total_amount))}</td>
                    <td className="px-4 py-3 text-[#130824]">
                      <StatusBadge tone={order.payment_status === "paid" ? "success" : "warning"}>
                        {order.payment_status}
                      </StatusBadge>
                    </td>
                    <td className="px-4 py-3 text-[#6d6478]">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}
