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
  const [priceOverrides, setPriceOverrides] = useState<Record<string, string>>({});
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

  const getPrice = (item: Item): number => {
    const override = priceOverrides[item.id];
    if (override !== undefined) {
      const parsed = parseFloat(override);
      return isNaN(parsed) ? parseFloat(item.price) : parsed;
    }
    return parseFloat(item.price);
  };

  const setQty = (item: Item, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((e) => e.item.id !== item.id));
      return;
    }
    setCart((prev) => {
      const existing = prev.find((e) => e.item.id === item.id);
      if (existing) return prev.map((e) => (e.item.id === item.id ? { ...e, qty } : e));
      return [...prev, { item, qty }];
    });
  };

  const subtotal = cart.reduce((sum, entry) => sum + getPrice(entry.item) * entry.qty, 0);
  const vat = cart.reduce(
    (sum, entry) =>
      sum + getPrice(entry.item) * entry.qty * (parseFloat(entry.item.gst_rate) / 100),
    0
  );
  const total = subtotal + vat;

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
        items: cart.map((entry) => ({
          item_id: entry.item.id,
          quantity: entry.qty,
          unit_price: (priceOverrides[entry.item.id] ?? entry.item.price).toString(),
        })),
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

            {cart.length > 0 && (
              <div className="mb-5 space-y-2 rounded-2xl border border-purple-100 bg-purple-50/50 p-3">
                <p className="px-1 text-xs font-black uppercase tracking-wide text-[#6d6478]">Selected Items</p>
                {cart.map((entry) => {
                  const priceVal = priceOverrides[entry.item.id] ?? entry.item.price;
                  const belowCost = !!(
                    entry.item.cost_price && getPrice(entry.item) <= parseFloat(entry.item.cost_price)
                  );
                  return (
                    <div key={entry.item.id} className="rounded-xl border border-purple-200 bg-white px-3 py-2.5">
                      <div className="flex items-center justify-between gap-3">
                        <p className="truncate text-sm font-bold text-[#130824]">
                          {entry.item.name}
                          {entry.item.sku && (
                            <span className="ml-2 text-xs font-normal text-[#9c92aa]">{entry.item.sku}</span>
                          )}
                        </p>
                        <button
                          onClick={() => setQty(entry.item, 0)}
                          className="shrink-0 text-xs font-bold text-red-500 transition hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-3">
                        <div className="flex shrink-0 items-center gap-1.5">
                          <button
                            onClick={() => setQty(entry.item, entry.qty - 1)}
                            className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-purple-100 text-sm font-black text-purple-700 transition hover:bg-purple-200"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={entry.qty}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              setQty(entry.item, isNaN(val) ? 0 : val);
                            }}
                            className="w-14 rounded-lg border border-purple-200 bg-white px-1 py-1 text-center text-sm font-black text-[#130824] outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                          />
                          <button
                            onClick={() => setQty(entry.item, entry.qty + 1)}
                            className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-purple-700 text-white transition hover:bg-purple-800"
                          >
                            <PlusIcon />
                          </button>
                        </div>

                        <div className="flex items-center gap-1">
                          <span className="text-xs font-semibold text-[#6d6478]">AED</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={priceVal}
                            onChange={(e) =>
                              setPriceOverrides((prev) => ({ ...prev, [entry.item.id]: e.target.value }))
                            }
                            className={`w-20 rounded-lg border px-2 py-1 text-sm font-bold text-[#130824] outline-none focus:ring-2 ${
                              belowCost
                                ? "border-amber-400 bg-amber-50 focus:border-amber-400 focus:ring-amber-100"
                                : "border-purple-200 bg-white focus:border-purple-400 focus:ring-purple-100"
                            }`}
                          />
                          {parseFloat(entry.item.gst_rate) > 0 && (
                            <span className="text-xs text-[#9c92aa]">+{entry.item.gst_rate}% VAT</span>
                          )}
                        </div>

                        <span className="ml-auto text-sm font-black text-[#130824]">
                          AED {(getPrice(entry.item) * entry.qty).toFixed(2)}
                        </span>
                      </div>

                      {belowCost && (
                        <p className="mt-1.5 text-xs font-bold text-amber-600">
                          ⚠ Sale price is below cost (AED {entry.item.cost_price})
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <p className="mb-2 px-1 text-xs font-black uppercase tracking-wide text-[#6d6478]">Catalog</p>
            <input
              type="search"
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`${inputClass} mb-3`}
            />

            {loading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-12 animate-pulse rounded-xl bg-purple-100/70" />
                ))}
              </div>
            ) : (
              <div className="max-h-[24rem] space-y-1.5 overflow-y-auto pr-1">
                {filtered.length === 0 && (
                  <p className="rounded-2xl bg-purple-50 p-4 text-center text-sm text-[#6d6478]">No items match your search.</p>
                )}
                {filtered.map((item) => {
                  const qty = cartMap[item.id] || 0;
                  const inStock = (item.stock ?? 0) > 0;
                  return (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2 transition ${
                        qty > 0
                          ? "border-purple-200 bg-purple-50/40"
                          : "border-[#eee7f8] bg-white hover:border-purple-200 hover:bg-purple-50/30"
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-[#130824]">
                          {item.name}
                          {item.sku && (
                            <span className="ml-2 text-xs font-normal text-[#9c92aa]">{item.sku}</span>
                          )}
                        </p>
                        <div className="mt-0.5 flex flex-wrap items-center gap-2">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                            inStock ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"
                          }`}>
                            Stock: {item.stock ?? 0}
                          </span>
                          <span className="text-xs font-semibold text-[#6d6478]">AED {item.price}</span>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {qty > 0 && (
                          <span className="rounded-full bg-purple-100 px-2.5 py-1 text-xs font-black text-purple-700">
                            {qty} in cart
                          </span>
                        )}
                        <button
                          onClick={() => setQty(item, qty + 1)}
                          className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-purple-700 text-white transition hover:bg-purple-800"
                        >
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
                    <span className="font-bold">AED {(getPrice(entry.item) * entry.qty).toFixed(2)}</span>
                  </div>
                ))}
                <div className="space-y-2 border-t border-[#eee7f8] pt-3">
                  <div className="flex justify-between text-sm text-[#6d6478]">
                    <span>Subtotal</span>
                    <span>AED {subtotal.toFixed(2)}</span>
                  </div>
                  {vat > 0 && (
                    <div className="flex justify-between text-sm text-[#6d6478]">
                      <span>VAT</span>
                      <span>AED {vat.toFixed(2)}</span>
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
