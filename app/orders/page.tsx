"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell, EmptyState, PageHeader, PlusIcon, StatusBadge } from "@/components/AppShell";
import { ordersAPI, Order } from "@/lib/api";

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
          <Link href="/orders/new" className="app-btn-primary">
            <PlusIcon /> New Order
          </Link>
        }
      />

      <input
        type="search"
        placeholder="Search by customer name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="app-input mb-4"
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
        <div className="app-table-wrap">
          <table className="app-table">
            <thead>
              <tr>
                {["Customer", "Salesman", "Total", "Payment", "Status", "Date"].map((heading) => (
                  <th key={heading} className="app-th">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eee7f8]">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-purple-50/50">
                  <td className="app-td font-bold">
                    {order.customer_name}
                    {order.customer_phone && (
                      <span className="block text-xs font-medium text-[#6d6478]">{order.customer_phone}</span>
                    )}
                  </td>
                  <td className="app-td text-[#6d6478]">{order.salesman_name || "-"}</td>
                  <td className="app-td font-bold">{fmt(order.total_amount)}</td>
                  <td className="app-td">
                    <StatusBadge tone={order.payment_status === "paid" ? "success" : "warning"}>
                      {order.payment_status}
                    </StatusBadge>
                  </td>
                  <td className="app-td capitalize text-[#6d6478]">{order.status}</td>
                  <td className="app-td text-[#6d6478]">{new Date(order.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}
