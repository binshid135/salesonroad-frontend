"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell, Card, PageHeader, PlusIcon } from "@/components/AppShell";
import { itemsAPI, ordersAPI, Item } from "@/lib/api";

interface CartEntry {
  item: Item;
  qty: number;
}

const buttonPrimary =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[#6d28d9] px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-purple-900/15 transition hover:bg-[#581c87] disabled:cursor-not-allowed disabled:opacity-60";
const inputClass =
  "w-full rounded-xl border border-purple-100 bg-white px-3 py-2.5 text-sm font-semibold text-[#130824] outline-none transition placeholder:text-[#9c92aa] focus:border-purple-400 focus:ring-4 focus:ring-purple-100";
const labelClass = "mb-1.5 block text-xs font-black uppercase tracking-wide text-[#6d6478]";
const sectionTitleClass = "text-lg font-black text-[#130824]";
const alertErrorClass = "rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700";

export default function NewOrderPage() {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartEntry[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentStatus, setPaymentStatus] = useState("paid");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    itemsAPI.list().then((res) => {
      setItems(res.data);
      setLoading(false);
    });
  }, []);

  const filtered = items.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.sku || "").toLowerCase().includes(search.toLowerCase())
  );

  const cartMap = Object.fromEntries(cart.map((entry) => [entry.item.id, entry.qty]));

  const setQty = (item: Item, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((entry) => entry.item.id !== item.id));
      return;
    }

    setCart((prev) => {
      const existing = prev.find((entry) => entry.item.id === item.id);
      if (existing) {
        return prev.map((entry) => (entry.item.id === item.id ? { ...entry, qty } : entry));
      }
      return [...prev, { item, qty }];
    });
  };

  const subtotal = cart.reduce((sum, entry) => sum + parseFloat(entry.item.price) * entry.qty, 0);
  const gst = cart.reduce(
    (sum, entry) =>
      sum + parseFloat(entry.item.price) * entry.qty * (parseFloat(entry.item.gst_rate) / 100),
    0
  );
  const total = subtotal + gst;

  const handleSubmit = async () => {
    if (!customerName.trim()) {
      setError("Customer name is required.");
      return;
    }
    if (cart.length === 0) {
      setError("Add at least one item.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await ordersAPI.create({
        customer_name: customerName,
        customer_phone: customerPhone,
        payment_method: paymentMethod,
        payment_status: paymentStatus,
        items: cart.map((entry) => ({ item_id: entry.item.id, quantity: entry.qty })),
      });
      router.push("/orders");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        "Failed to create order.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell>
      <PageHeader title="New Order" subtitle="Build a customer order from your active item catalog." />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-5">
        <div className="min-w-0 space-y-4 lg:space-y-5">
          <Card className="p-4 sm:p-5">
            <h2 className={`${sectionTitleClass} mb-4`}>Customer</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Name *</label>
                <input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Shop name"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <input
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+971 50 000 0000"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Payment Method</label>
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className={inputClass}>
                  {["cash", "card", "bank_transfer", "credit"].map((method) => (
                    <option key={method} value={method}>
                      {method.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Payment Status</label>
                <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} className={inputClass}>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className={sectionTitleClass}>Add Items</h2>
              <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-700">
                {cart.length} selected
              </span>
            </div>
            <input
              type="search"
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`${inputClass} mb-4`}
            />

            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-14 animate-pulse rounded-2xl bg-purple-100/70" />
                ))}
              </div>
            ) : (
              <div className="max-h-[28rem] space-y-2 overflow-y-auto pr-1">
                {filtered.map((item) => {
                  const qty = cartMap[item.id] || 0;
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-[#eee7f8] bg-white px-3 py-3 transition hover:border-purple-200 hover:bg-purple-50/50"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-[#130824]">{item.name}</p>
                        <p className="text-xs text-[#6d6478]">
                          AED {item.price}
                          {parseFloat(item.gst_rate) > 0 && ` + ${item.gst_rate}% GST`}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                        <button
                          onClick={() => setQty(item, qty - 1)}
                          className="grid h-8 w-8 place-items-center rounded-full bg-purple-100 font-black text-purple-700 disabled:opacity-40"
                          disabled={qty === 0}
                        >
                          -
                        </button>
                        <span className="w-7 text-center text-sm font-black">{qty || ""}</span>
                        <button onClick={() => setQty(item, qty + 1)} className="grid h-8 w-8 place-items-center rounded-full bg-purple-700 text-white">
                          <PlusIcon />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-4 sm:p-5 lg:sticky lg:top-6">
            <h2 className={`${sectionTitleClass} mb-4`}>Order Summary</h2>
            {cart.length === 0 ? (
              <p className="rounded-2xl bg-purple-50 p-4 text-sm text-[#6d6478]">Add items to build the order total.</p>
            ) : (
              <div className="space-y-3">
                {cart.map((entry) => (
                  <div key={entry.item.id} className="flex justify-between gap-4 text-sm">
                    <span className="text-[#6d6478]">
                      {entry.item.name} x {entry.qty}
                    </span>
                    <span className="font-bold">AED {(parseFloat(entry.item.price) * entry.qty).toFixed(2)}</span>
                  </div>
                ))}
                <div className="space-y-2 border-t border-[#eee7f8] pt-3">
                  <div className="flex justify-between text-sm text-[#6d6478]">
                    <span>Subtotal</span>
                    <span>AED {subtotal.toFixed(2)}</span>
                  </div>
                  {gst > 0 && (
                    <div className="flex justify-between text-sm text-[#6d6478]">
                      <span>GST</span>
                      <span>AED {gst.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xl font-black text-[#130824]">
                    <span>Total</span>
                    <span>AED {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            {error && <div className={`${alertErrorClass} mt-4`}>{error}</div>}

            <button
              onClick={handleSubmit}
              disabled={submitting || cart.length === 0}
              className={`${buttonPrimary} mt-5 w-full whitespace-normal text-center`}
            >
              {submitting ? "Placing Order..." : `Place Order - AED ${total.toFixed(2)}`}
            </button>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
