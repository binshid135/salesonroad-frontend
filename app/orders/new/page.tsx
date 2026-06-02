"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import Sidebar from "@/components/Sidebar";
import { itemsAPI, ordersAPI, Item } from "@/lib/api";

interface CartEntry {
  item: Item;
  qty: number;
}

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
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      (i.sku || "").toLowerCase().includes(search.toLowerCase())
  );

  const cartMap = Object.fromEntries(cart.map((e) => [e.item.id, e.qty]));

  const setQty = (item: Item, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((e) => e.item.id !== item.id));
    } else {
      setCart((prev) => {
        const existing = prev.find((e) => e.item.id === item.id);
        if (existing) {
          return prev.map((e) => (e.item.id === item.id ? { ...e, qty } : e));
        }
        return [...prev, { item, qty }];
      });
    }
  };

  const subtotal = cart.reduce(
    (sum, e) => sum + parseFloat(e.item.price) * e.qty,
    0
  );
  const gst = cart.reduce(
    (sum, e) =>
      sum + parseFloat(e.item.price) * e.qty * (parseFloat(e.item.gst_rate) / 100),
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
        items: cart.map((e) => ({ item_id: e.item.id, quantity: e.qty })),
      });
      router.push("/orders");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || "Failed to create order.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-xl font-bold text-gray-900 mb-5">New Order</h1>

            {/* Customer info */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 space-y-3">
              <h2 className="text-sm font-semibold text-gray-700">Customer</h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Name *</label>
                  <input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Shop name"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Phone</label>
                  <input
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+971 50 000 0000"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {["cash", "card", "bank_transfer", "credit"].map((m) => (
                      <option key={m} value={m}>
                        {m.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Payment Status</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Item search */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
              <h2 className="text-sm font-semibold text-gray-700 mb-3">Add Items</h2>
              <input
                type="search"
                placeholder="Search items…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
              />

              {loading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {filtered.map((item) => {
                    const qty = cartMap[item.id] || 0;
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between py-2 px-1 rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.name}</p>
                          <p className="text-xs text-gray-400">
                            AED {item.price}
                            {parseFloat(item.gst_rate) > 0 && ` + ${item.gst_rate}% GST`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-3">
                          <button
                            onClick={() => setQty(item, qty - 1)}
                            className="w-7 h-7 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-sm font-bold"
                            disabled={qty === 0}
                          >
                            −
                          </button>
                          <span className="w-6 text-center text-sm font-semibold">
                            {qty || ""}
                          </span>
                          <button
                            onClick={() => setQty(item, qty + 1)}
                            className="w-7 h-7 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center text-sm font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Cart summary */}
            {cart.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
                <h2 className="text-sm font-semibold text-gray-700 mb-3">Order Summary</h2>
                <div className="space-y-1 mb-3">
                  {cart.map((e) => (
                    <div key={e.item.id} className="flex justify-between text-sm">
                      <span className="text-gray-700">
                        {e.item.name} × {e.qty}
                      </span>
                      <span className="font-medium">
                        AED {(parseFloat(e.item.price) * e.qty).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-100 pt-2 space-y-1">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Subtotal</span>
                    <span>AED {subtotal.toFixed(2)}</span>
                  </div>
                  {gst > 0 && (
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>GST</span>
                      <span>AED {gst.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-bold">
                    <span>Total</span>
                    <span>AED {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting || cart.length === 0}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl text-base transition disabled:opacity-60"
            >
              {submitting ? "Placing Order…" : `Place Order · AED ${total.toFixed(2)}`}
            </button>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
