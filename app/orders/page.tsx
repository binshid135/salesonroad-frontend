"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell, EmptyState, PageHeader, PlusIcon, StatusBadge } from "@/components/AppShell";
import { ordersAPI, Order } from "@/lib/api";

type Preset = "all" | "today" | "yesterday" | "week" | "month" | "custom";

function toISO(d: Date) {
  return d.toISOString().slice(0, 10);
}

function getPresetRange(preset: Preset): { from: string; to: string } {
  const now = new Date();
  const tod = toISO(now);
  if (preset === "today") return { from: tod, to: tod };
  if (preset === "yesterday") {
    const y = new Date(now); y.setDate(y.getDate() - 1);
    const ys = toISO(y); return { from: ys, to: ys };
  }
  if (preset === "week") {
    const start = new Date(now); start.setDate(now.getDate() - now.getDay());
    return { from: toISO(start), to: tod };
  }
  if (preset === "month") {
    return { from: toISO(new Date(now.getFullYear(), now.getMonth(), 1)), to: tod };
  }
  return { from: "", to: "" };
}

function DownloadIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

const buttonPrimary =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[#6d28d9] px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-purple-900/15 transition hover:bg-[#581c87]";
const inputClass =
  "w-full rounded-xl border border-purple-100 bg-white px-3 py-2.5 text-sm font-semibold text-[#130824] outline-none transition placeholder:text-[#9c92aa] focus:border-purple-400 focus:ring-4 focus:ring-purple-100";
const tableWrapClass = "overflow-x-auto rounded-2xl border border-white/80 bg-white shadow-[0_16px_40px_rgba(54,22,92,0.08)]";
const thClass = "bg-purple-50 px-4 py-3 text-xs font-black uppercase tracking-wide text-[#6d6478]";
const tdClass = "px-4 py-3 text-[#130824]";

const PRESETS: { key: Preset; label: string }[] = [
  { key: "all", label: "All" },
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
  { key: "custom", label: "Custom" },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [preset, setPreset] = useState<Preset>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [exportDate, setExportDate] = useState(toISO(new Date()));
  const [exporting, setExporting] = useState(false);

  const effectiveDateFrom = preset === "custom" ? dateFrom : getPresetRange(preset).from;
  const effectiveDateTo   = preset === "custom" ? dateTo   : getPresetRange(preset).to;

  const fetchOrders = (q?: string, from?: string, to?: string) => {
    setLoading(true);
    ordersAPI
      .list(q, from, to)
      .then((res) => setOrders(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, []);

  useEffect(() => {
    const timer = setTimeout(
      () => fetchOrders(search || undefined, effectiveDateFrom || undefined, effectiveDateTo || undefined),
      300,
    );
    return () => clearTimeout(timer);
  }, [search, effectiveDateFrom, effectiveDateTo]);

  const handlePreset = (p: Preset) => {
    setPreset(p);
    if (p !== "custom") { setDateFrom(""); setDateTo(""); }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await ordersAPI.exportDaily(exportDate);
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `sales_${exportDate}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  const fmt = (n: string | number) =>
    new Intl.NumberFormat("en-AE", { style: "currency", currency: "AED" }).format(
      typeof n === "string" ? parseFloat(n) : n,
    );

  const summaryTotal = orders.reduce((s, o) => s + parseFloat(o.total_amount), 0);
  const paidCount = orders.filter((o) => o.payment_status === "paid").length;

  return (
    <AppShell>
      <PageHeader
        title="Orders"
        subtitle="Review every sale, payment state, and customer interaction."
        actions={
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            <div className="flex items-center gap-2 rounded-xl border border-purple-200 bg-white px-3 py-2 shadow-sm">
              <DownloadIcon />
              <input
                type="date"
                value={exportDate}
                onChange={(e) => setExportDate(e.target.value)}
                className="text-sm font-semibold text-[#130824] outline-none"
              />
              <button
                onClick={handleExport}
                disabled={exporting}
                className="rounded-lg bg-[#6d28d9] px-3 py-1 text-xs font-black text-white transition hover:bg-[#581c87] disabled:opacity-60"
              >
                {exporting ? "Exporting…" : "Export XLSX"}
              </button>
            </div>
            <Link href="/orders/new" className={`${buttonPrimary} w-full sm:w-auto`}>
              <PlusIcon /> New Order
            </Link>
          </div>
        }
      />

      {/* Search + date filters */}
      <div className="mb-4 space-y-3">
        <input
          type="search"
          placeholder="Search by customer name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={inputClass}
        />

        {/* Quick preset chips */}
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handlePreset(key)}
              className={`rounded-full px-3 py-1.5 text-xs font-black transition ${
                preset === key
                  ? "bg-[#6d28d9] text-white shadow"
                  : "bg-white border border-purple-200 text-[#6d6478] hover:border-purple-400 hover:text-purple-800"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Custom date range */}
        {preset === "custom" && (
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-black uppercase tracking-wide text-[#6d6478]">From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="rounded-xl border border-purple-100 bg-white px-3 py-2 text-sm font-semibold text-[#130824] outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-100"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-black uppercase tracking-wide text-[#6d6478]">To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="rounded-xl border border-purple-100 bg-white px-3 py-2 text-sm font-semibold text-[#130824] outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-100"
              />
            </div>
            {(dateFrom || dateTo) && (
              <button
                onClick={() => { setDateFrom(""); setDateTo(""); }}
                className="text-xs font-bold text-[#6d6478] underline underline-offset-2 hover:text-red-600"
              >
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* Summary bar */}
      {!loading && orders.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-purple-100 bg-white px-4 py-2.5 shadow-sm">
            <span className="text-xs font-black uppercase tracking-wide text-[#6d6478]">Orders</span>
            <span className="text-lg font-black text-[#130824]">{orders.length}</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-purple-100 bg-white px-4 py-2.5 shadow-sm">
            <span className="text-xs font-black uppercase tracking-wide text-[#6d6478]">Total Sales</span>
            <span className="text-lg font-black text-[#130824]">{fmt(summaryTotal)}</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-purple-100 bg-white px-4 py-2.5 shadow-sm">
            <span className="text-xs font-black uppercase tracking-wide text-[#6d6478]">Paid</span>
            <span className="text-lg font-black text-emerald-600">{paidCount}</span>
            <span className="text-xs text-[#6d6478]">/ {orders.length}</span>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-2xl bg-purple-100/70" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState title="No orders found" body="Try adjusting the date filter or search term." />
      ) : (
        <div className={tableWrapClass}>
          <table className="min-w-[52rem] border-collapse text-left text-sm">
            <thead>
              <tr>
                {["Customer", "Salesman", "Total", "Payment", "Status", "Date"].map((h) => (
                  <th key={h} className={thClass}>{h}</th>
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
