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
          <button onClick={openCreate} className="app-btn-primary">
            <PlusIcon /> Add Item
          </button>
        }
      />

      <input
        type="search"
        placeholder="Search items..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="app-input mb-4"
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
        <div className="app-table-wrap">
          <table className="app-table">
            <thead>
              <tr>
                {["Name", "SKU", "Price", "GST %", "Unit", ""].map((heading) => (
                  <th key={heading} className="app-th">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eee7f8]">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-purple-50/50">
                  <td className="app-td font-bold">{item.name}</td>
                  <td className="app-td text-[#6d6478]">{item.sku || "-"}</td>
                  <td className="app-td font-semibold">AED {item.price}</td>
                  <td className="app-td">{item.gst_rate}%</td>
                  <td className="app-td text-[#6d6478]">{item.unit || "-"}</td>
                  <td className="app-td text-right">
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
        <div className="app-modal-backdrop">
          <div className="app-modal">
            <h2 className="app-section-title mb-4">{editItem ? "Edit Item" : "Add New Item"}</h2>
            {error && <div className="app-alert-error mb-4">{error}</div>}
            <form onSubmit={handleSave} className="space-y-3">
              {[
                { label: "Name *", field: "name", type: "text", placeholder: "Product name" },
                { label: "SKU", field: "sku", type: "text", placeholder: "Optional" },
                { label: "Price (AED) *", field: "price", type: "number", placeholder: "0.00" },
                { label: "GST Rate (%)", field: "gst_rate", type: "number", placeholder: "0" },
                { label: "Unit", field: "unit", type: "text", placeholder: "pcs / kg / box" },
              ].map(({ label, field, type, placeholder }) => (
                <div key={field}>
                  <label className="app-label">{label}</label>
                  <input
                    type={type}
                    step={type === "number" ? "0.01" : undefined}
                    min={type === "number" ? "0" : undefined}
                    value={form[field as keyof ItemFormData]}
                    onChange={(e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))}
                    required={label.includes("*")}
                    className="app-input"
                    placeholder={placeholder}
                  />
                </div>
              ))}

              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={saving} className="app-btn-primary flex-1">
                  {saving ? "Saving..." : "Save"}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="app-btn-secondary flex-1">
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
