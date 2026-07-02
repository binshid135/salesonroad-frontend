"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AppShell, Card, PageHeader, StatusBadge } from "@/components/AppShell";
import { ordersAPI, Order } from "@/lib/api";

const tableWrapClass = "overflow-x-auto rounded-2xl border border-white/80 bg-white shadow-[0_16px_40px_rgba(54,22,92,0.08)]";
const thClass = "bg-purple-50 px-4 py-3 text-xs font-black uppercase tracking-wide text-[#6d6478]";
const tdClass = "px-4 py-3 text-[#130824]";

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    ordersAPI.get(id).then((res) => {
      setOrder(res.data);
      setLoading(false);
    });
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const fmt = (n: string | number) =>
    new Intl.NumberFormat("en-AE", { style: "currency", currency: "AED" }).format(
      typeof n === "string" ? parseFloat(n) : n,
    );

  if (loading) {
    return (
      <AppShell>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-2xl bg-purple-100/70" />
          ))}
        </div>
      </AppShell>
    );
  }

  if (!order) return null;

  return (
    <AppShell>
      <div className="mb-4">
        <Link href="/orders" className="text-sm font-bold text-[#6d6478] hover:text-purple-800">
          ← Orders
        </Link>
      </div>

      <PageHeader
        title={order.customer_name}
        subtitle={order.customer_phone || undefined}
        actions={
          <div className="flex flex-wrap gap-2">
            <StatusBadge tone={order.payment_status === "paid" ? "success" : "warning"}>
              {order.payment_status}
            </StatusBadge>
            <StatusBadge tone="neutral">{order.status}</StatusBadge>
          </div>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 md:grid-cols-4">
        {[
          { label: "Total", value: fmt(order.total_amount) },
          { label: "GST", value: fmt(order.gst_amount) },
          { label: "Payment Method", value: order.payment_method || "-" },
          { label: "Date", value: new Date(order.created_at).toLocaleString() },
        ].map(({ label, value }) => (
          <Card key={label} className="p-4">
            <p className="text-xs font-black uppercase tracking-wide text-[#6d6478]">{label}</p>
            <p className="mt-1 text-lg font-black text-[#130824]">{value}</p>
          </Card>
        ))}
      </div>

      {order.salesman_name && (
        <p className="mb-6 text-sm text-[#6d6478]">
          Sold by <span className="font-bold text-[#130824]">{order.salesman_name}</span>
        </p>
      )}

      <div className={tableWrapClass}>
        <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
          <thead>
            <tr>
              {["Item", "Quantity", "Unit Price", "Total"].map((h) => (
                <th key={h} className={thClass}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eee7f8]">
            {order.order_items.map((oi) => (
              <tr key={oi.id}>
                <td className={`${tdClass} font-bold`}>{oi.item_name}</td>
                <td className={tdClass}>{oi.quantity}</td>
                <td className={tdClass}>{fmt(oi.unit_price)}</td>
                <td className={`${tdClass} font-bold`}>{fmt(oi.total_price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
