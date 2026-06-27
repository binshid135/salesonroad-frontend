"use client";

import { useEffect, useState } from "react";
import { AppShell, EmptyState, PageHeader, PlusIcon } from "@/components/AppShell";
import { itemsAPI, Item } from "@/lib/api";

interface ItemFormData {
  name: string;
  sku: string;
  price: string;
  gst_rate: string;
  unit: string;
}

const EMPTY_FORM: ItemFormData = { name: "", sku: "", price: "", gst_rate: "0", unit: "" };
const buttonPrimary =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[#6d28d9] px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-purple-900/15 transition hover:bg-[#581c87] disabled:cursor-not-allowed disabled:opacity-60";
const buttonSecondary =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-purple-200 bg-white px-4 py-2.5 text-sm font-black text-purple-800 transition hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-60";
const inputClass =
  "w-full rounded-xl border border-purple-100 bg-white px-3 py-2.5 text-sm font-semibold text-[#130824] outline-none transition placeholder:text-[#9c92aa] focus:border-purple-400 focus:ring-4 focus:ring-purple-100";
const labelClass = "mb-1.5 block text-xs font-black uppercase tracking-wide text-[#6d6478]";
const tableWrapClass = "overflow-x-auto rounded-2xl border border-white/80 bg-white shadow-[0_16px_40px_rgba(54,22,92,0.08)]";
const thClass = "bg-purple-50 px-4 py-3 text-xs font-black uppercase tracking-wide text-[#6d6478]";
const tdClass = "px-4 py-3 text-[#130824]";
const modalBackdropClass = "fixed inset-0 z-50 grid place-items-center bg-[#130824]/55 p-4 backdrop-blur-sm";
const modalClass = "max-h-[calc(100vh-2rem)] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-4 shadow-2xl shadow-purple-950/25 sm:p-5";
const alertErrorClass = "rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700";

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Item | null>(null);
  const [form, setForm] = useState<ItemFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchItems = (q?: string) => {
    setLoading(true);
    itemsAPI
      .list(q)
      .then((res) => setItems(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let cancelled = false;

    itemsAPI
      .list()
      .then((res) => {
        if (!cancelled) setItems(res.data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchItems(search || undefined), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const openCreate = () => {
    setEditItem(null);
    setForm(EMPTY_FORM);
    setError("");
    setShowForm(true);
  };

  const openEdit = (item: Item) => {
    setEditItem(item);
    setForm({
      name: item.name,
      sku: item.sku || "",
      price: item.price,
      gst_rate: item.gst_rate,
      unit: item.unit || "",
    });
    setError("");
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editItem) {
        await itemsAPI.update(editItem.id, form);
      } else {
        await itemsAPI.create(form);
      }
      setShowForm(false);
      fetchItems(search || undefined);
    } catch (err: unknown) {
      const data = (err as { response?: { data?: Record<string, string[]> } })?.response?.data;
      setError(data ? Object.values(data).flat()[0] || "Failed to save item." : "Failed to save item.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Deactivate this item?")) return;
    await itemsAPI.delete(id);
    fetchItems(search || undefined);
  };

  return (
    <AppShell>
      <PageHeader
        title="Items"
        subtitle="Manage the catalog your sales team uses on the road."
        actions={
          <button onClick={openCreate} className={`${buttonPrimary} w-full sm:w-auto`}>
            <PlusIcon /> Add Item
          </button>
        }
      />

      <input
        type="search"
        placeholder="Search items..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className={`${inputClass} mb-4`}
      />

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-2xl bg-purple-100/70" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState title="No items yet" body="Add your first product to start building orders." />
      ) : (
        <div className={tableWrapClass}>
          <table className="min-w-[46rem] border-collapse text-left text-sm">
            <thead>
              <tr>
                {["Name", "SKU", "Price", "GST %", "Unit", ""].map((heading) => (
                  <th key={heading} className={thClass}>
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eee7f8]">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-purple-50/50">
                  <td className={`${tdClass} font-bold`}>{item.name}</td>
                  <td className={`${tdClass} text-[#6d6478]`}>{item.sku || "-"}</td>
                  <td className={`${tdClass} font-semibold`}>AED {item.price}</td>
                  <td className={tdClass}>{item.gst_rate}%</td>
                  <td className={`${tdClass} text-[#6d6478]`}>{item.unit || "-"}</td>
                  <td className={`${tdClass} text-right`}>
                    <button onClick={() => openEdit(item)} className="mr-3 text-xs font-bold text-purple-700">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="text-xs font-bold text-red-600">
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className={modalBackdropClass}>
          <div className={modalClass}>
            <h2 className="mb-4 text-lg font-black text-[#130824]">{editItem ? "Edit Item" : "Add New Item"}</h2>
            {error && <div className={`${alertErrorClass} mb-4`}>{error}</div>}
            <form onSubmit={handleSave} className="space-y-3">
              {[
                { label: "Name *", field: "name", type: "text", placeholder: "Product name" },
                { label: "SKU", field: "sku", type: "text", placeholder: "Optional" },
                { label: "Price (AED) *", field: "price", type: "number", placeholder: "0.00" },
                { label: "GST Rate (%)", field: "gst_rate", type: "number", placeholder: "0" },
                { label: "Unit", field: "unit", type: "text", placeholder: "pcs / kg / box" },
              ].map(({ label, field, type, placeholder }) => (
                <div key={field}>
                  <label className={labelClass}>{label}</label>
                  <input
                    type={type}
                    step={type === "number" ? "0.01" : undefined}
                    min={type === "number" ? "0" : undefined}
                    value={form[field as keyof ItemFormData]}
                    onChange={(e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))}
                    required={label.includes("*")}
                    className={inputClass}
                    placeholder={placeholder}
                  />
                </div>
              ))}

              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={saving} className={`${buttonPrimary} flex-1`}>
                  {saving ? "Saving..." : "Save"}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className={`${buttonSecondary} flex-1`}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
