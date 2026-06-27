"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell, EmptyState, PageHeader, PlusIcon, StatusBadge } from "@/components/AppShell";
import { ordersAPI, Order } from "@/lib/api";

const buttonPrimary =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[#6d28d9] px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-purple-900/15 transition hover:bg-[#581c87]";
const inputClass =
  "w-full rounded-xl border border-purple-100 bg-white px-3 py-2.5 text-sm font-semibold text-[#130824] outline-none transition placeholder:text-[#9c92aa] focus:border-purple-400 focus:ring-4 focus:ring-purple-100";
const tableWrapClass = "overflow-x-auto rounded-2xl border border-white/80 bg-white shadow-[0_16px_40px_rgba(54,22,92,0.08)]";
const thClass = "bg-purple-50 px-4 py-3 text-xs font-black uppercase tracking-wide text-[#6d6478]";
const tdClass = "px-4 py-3 text-[#130824]";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    ordersAPI.list().then((res) => {
      setOrders(res.data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true);
      ordersAPI
        .list(search || undefined)
        .then((res) => setOrders(res.data))
        .finally(() => setLoading(false));
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fmt = (n: string) =>
    new Intl.NumberFormat("en-AE", { style: "currency", currency: "AED" }).format(parseFloat(n));

  return (
    <AppShell>
      <PageHeader
        title="Orders"
        subtitle="Review every sale, payment state, and customer interaction."
        actions={
          <Link href="/orders/new" className={`${buttonPrimary} w-full sm:w-auto`}>
            <PlusIcon /> New Order
          </Link>
        }
      />

      <input
        type="search"
        placeholder="Search by customer name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className={`${inputClass} mb-4`}
      />

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-2xl bg-purple-100/70" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState title="No orders found" body="Try a different search or create a new order." />
      ) : (
        <div className={tableWrapClass}>
          <table className="min-w-[52rem] border-collapse text-left text-sm">
            <thead>
              <tr>
                {["Customer", "Salesman", "Total", "Payment", "Status", "Date"].map((heading) => (
                  <th key={heading} className={thClass}>
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eee7f8]">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-purple-50/50">
                  <td className={`${tdClass} font-bold`}>
                    {order.customer_name}
                    {order.customer_phone && (
                      <span className="block text-xs font-medium text-[#6d6478]">{order.customer_phone}</span>
                    )}
                  </td>
                  <td className={`${tdClass} text-[#6d6478]`}>{order.salesman_name || "-"}</td>
                  <td className={`${tdClass} font-bold`}>{fmt(order.total_amount)}</td>
                  <td className={tdClass}>
                    <StatusBadge tone={order.payment_status === "paid" ? "success" : "warning"}>
                      {order.payment_status}
                    </StatusBadge>
                  </td>
                  <td className={`${tdClass} capitalize text-[#6d6478]`}>{order.status}</td>
                  <td className={`${tdClass} text-[#6d6478]`}>{new Date(order.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}
