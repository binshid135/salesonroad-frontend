"use client";

import { useEffect, useRef, useState } from "react";
import { AppShell, EmptyState, PageHeader, PlusIcon } from "@/components/AppShell";
import { itemsAPI, Item } from "@/lib/api";

interface ItemFormData {
  name: string;
  sku: string;
  stock: string;
  cost_price: string;
  price: string;
  mrp: string;
  gst_rate: string;
  unit: string;
}

interface ImportResult {
  created: number;
  updated: number;
  errors: { row: number; message: string }[];
}

type StockMode = "set" | "add" | "remove";

const EMPTY_FORM: ItemFormData = {
  name: "", sku: "", stock: "", cost_price: "", price: "", mrp: "", gst_rate: "0", unit: "",
};

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

function UploadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function downloadTemplate() {
  const header = "Sl,Item Name,Barcode,Stock,Cost,Cost.Value,Sale Price,Sale Value,MRP";
  const example = "1,Sample Product,BAR001,100,10.00,,15.00,,20.00";
  const blob = new Blob([header + "\n" + example], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "items_template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Item | null>(null);
  const [form, setForm] = useState<ItemFormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showImport, setShowImport] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importError, setImportError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stockItem, setStockItem] = useState<Item | null>(null);
  const [stockMode, setStockMode] = useState<StockMode>("set");
  const [stockValue, setStockValue] = useState("");
  const [stockSaving, setStockSaving] = useState(false);
  const [stockError, setStockError] = useState("");

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
      .then((res) => { if (!cancelled) setItems(res.data); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
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
      stock: item.stock?.toString() ?? "0",
      cost_price: item.cost_price ?? "",
      price: item.price,
      mrp: item.mrp ?? "",
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
      const payload = { ...form, stock: Number(form.stock) || 0 };
      if (editItem) {
        await itemsAPI.update(editItem.id, payload);
      } else {
        await itemsAPI.create(payload);
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

  const openStockModal = (item: Item) => {
    setStockItem(item);
    setStockMode("set");
    setStockValue(item.stock?.toString() ?? "0");
    setStockError("");
  };

  const handleStockSave = async () => {
    if (!stockItem) return;
    const qty = parseInt(stockValue, 10);
    if (isNaN(qty) || qty < 0) {
      setStockError("Please enter a valid non-negative number.");
      return;
    }
    let newStock: number;
    if (stockMode === "set") {
      newStock = qty;
    } else if (stockMode === "add") {
      newStock = (stockItem.stock ?? 0) + qty;
    } else {
      newStock = Math.max(0, (stockItem.stock ?? 0) - qty);
    }
    setStockSaving(true);
    setStockError("");
    try {
      await itemsAPI.update(stockItem.id, { stock: newStock } as never);
      setStockItem(null);
      fetchItems(search || undefined);
    } catch {
      setStockError("Failed to update stock. Please try again.");
    } finally {
      setStockSaving(false);
    }
  };

  const openImport = () => {
    setImportFile(null);
    setImportResult(null);
    setImportError("");
    setShowImport(true);
  };

  const handleImport = async () => {
    if (!importFile) return;
    setImporting(true);
    setImportError("");
    setImportResult(null);
    try {
      const res = await itemsAPI.importFile(importFile);
      setImportResult(res.data);
      fetchItems(search || undefined);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setImportError(msg || "Import failed. Please check the file and try again.");
    } finally {
      setImporting(false);
    }
  };

  const FORM_FIELDS = [
    { label: "Item Name *", field: "name", type: "text", placeholder: "Product name" },
    { label: "Barcode / SKU", field: "sku", type: "text", placeholder: "Optional" },
    { label: "Stock *", field: "stock", type: "number", placeholder: "0" },
    { label: "Cost *", field: "cost_price", type: "number", placeholder: "0.00" },
    { label: "Sale Price *", field: "price", type: "number", placeholder: "0.00" },
    { label: "MRP", field: "mrp", type: "number", placeholder: "0.00" },
    { label: "GST Rate (%)", field: "gst_rate", type: "number", placeholder: "0" },
    { label: "Unit", field: "unit", type: "text", placeholder: "pcs / kg / box" },
  ] as const;

  const TABLE_COLS = [
    { heading: "Name", key: "name" as const },
    { heading: "Barcode", key: "sku" as const },
    { heading: "Stock", key: "stock" as const },
    { heading: "Cost", key: "cost_price" as const },
    { heading: "Sale Price", key: "price" as const },
    { heading: "MRP", key: "mrp" as const },
    { heading: "Unit", key: "unit" as const },
  ];

  return (
    <AppShell>
      <PageHeader
        title="Items"
        subtitle="Manage the catalog your sales team uses on the road."
        actions={
          <div className="flex w-full gap-2 sm:w-auto">
            <button onClick={openImport} className={`${buttonSecondary} flex-1 sm:flex-none`}>
              <UploadIcon /> Import
            </button>
            <button onClick={openCreate} className={`${buttonPrimary} flex-1 sm:flex-none`}>
              <PlusIcon /> Add Item
            </button>
          </div>
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
          <table className="w-full min-w-[56rem] border-collapse text-left text-sm">
            <thead>
              <tr>
                {[...TABLE_COLS.map((c) => c.heading), ""].map((h) => (
                  <th key={h} className={thClass}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eee7f8]">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-purple-50/50">
                  <td className={`${tdClass} font-bold`}>{item.name}</td>
                  <td className={`${tdClass} text-[#6d6478]`}>{item.sku || "-"}</td>
                  <td className={tdClass}>{item.stock ?? 0}</td>
                  <td className={tdClass}>{item.cost_price ? `AED ${item.cost_price}` : "-"}</td>
                  <td className={`${tdClass} font-semibold`}>AED {item.price}</td>
                  <td className={`${tdClass} text-[#6d6478]`}>{item.mrp ? `AED ${item.mrp}` : "-"}</td>
                  <td className={`${tdClass} text-[#6d6478]`}>{item.unit || "-"}</td>
                  <td className={`${tdClass} text-right`}>
                    <button onClick={() => openStockModal(item)} className="mr-3 text-xs font-bold text-emerald-700">
                      Stock
                    </button>
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

      {/* Add / Edit modal */}
      {showForm && (
        <div className={modalBackdropClass}>
          <div className={modalClass}>
            <h2 className="mb-4 text-lg font-black text-[#130824]">{editItem ? "Edit Item" : "Add New Item"}</h2>
            {error && <div className={`${alertErrorClass} mb-4`}>{error}</div>}
            <form onSubmit={handleSave} className="space-y-3">
              {FORM_FIELDS.map(({ label, field, type, placeholder }) => (
                <div key={field}>
                  <label className={labelClass}>{label}</label>
                  <input
                    type={type}
                    step={type === "number" ? "0.01" : undefined}
                    min={type === "number" ? "0" : undefined}
                    value={form[field]}
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

      {/* Update Stock modal */}
      {stockItem && (
        <div className={modalBackdropClass}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl shadow-purple-950/25">
            <h2 className="mb-1 text-lg font-black text-[#130824]">Update Stock</h2>
            <p className="mb-4 text-sm text-[#6d6478]">
              <span className="font-bold text-[#130824]">{stockItem.name}</span>
              {stockItem.sku ? ` · ${stockItem.sku}` : ""}
            </p>

            <div className="mb-4 flex items-center justify-between rounded-xl border border-purple-100 bg-purple-50 px-4 py-3">
              <span className="text-xs font-black uppercase tracking-wide text-[#6d6478]">Current Stock</span>
              <span className="text-2xl font-black text-[#130824]">{stockItem.stock ?? 0}</span>
            </div>

            <div className="mb-3 flex rounded-xl border border-purple-100 bg-purple-50 p-1">
              {(["set", "add", "remove"] as StockMode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setStockMode(m); setStockValue(""); setStockError(""); }}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-black capitalize transition ${
                    stockMode === m
                      ? "bg-white text-[#130824] shadow"
                      : "text-[#6d6478] hover:text-[#130824]"
                  }`}
                >
                  {m === "set" ? "Set to" : m === "add" ? "+ Add" : "− Remove"}
                </button>
              ))}
            </div>

            <div className="mb-4">
              <label className={labelClass}>
                {stockMode === "set" ? "New stock quantity" : stockMode === "add" ? "Quantity to add" : "Quantity to remove"}
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={stockValue}
                onChange={(e) => { setStockValue(e.target.value); setStockError(""); }}
                onKeyDown={(e) => { if (e.key === "Enter") handleStockSave(); }}
                className={inputClass}
                placeholder="0"
                autoFocus
              />
              {stockMode !== "set" && (
                <p className="mt-1.5 text-xs text-[#9c92aa]">
                  Result: {
                    stockMode === "add"
                      ? (stockItem.stock ?? 0) + (parseInt(stockValue, 10) || 0)
                      : Math.max(0, (stockItem.stock ?? 0) - (parseInt(stockValue, 10) || 0))
                  } units
                </p>
              )}
            </div>

            {stockError && <div className={`${alertErrorClass} mb-4`}>{stockError}</div>}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleStockSave}
                disabled={stockSaving || stockValue === ""}
                className={`${buttonPrimary} flex-1`}
              >
                {stockSaving ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => setStockItem(null)}
                className={`${buttonSecondary} flex-1`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import modal */}
      {showImport && (
        <div className={modalBackdropClass}>
          <div className={modalClass}>
            <h2 className="mb-1 text-lg font-black text-[#130824]">Import Items</h2>
            <p className="mb-4 text-sm text-[#6d6478]">
              Upload a CSV, Excel (.xlsx), or PDF file. Required columns: <strong>Item Name, Stock, Cost, Sale Price</strong>.
              Items with the same name <em>and</em> barcode will be updated; all others will be created.
            </p>

            <button
              type="button"
              onClick={downloadTemplate}
              className="mb-4 text-xs font-bold text-purple-700 underline underline-offset-2"
            >
              Download CSV template
            </button>

            <div
              className="mb-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-purple-200 bg-purple-50 px-4 py-8 transition hover:border-purple-400"
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadIcon />
              <span className="text-sm font-semibold text-[#6d6478]">
                {importFile ? importFile.name : "Click to select a file"}
              </span>
              <span className="text-xs text-[#9c92aa]">CSV, Excel (.xlsx / .xls), or PDF</span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls,.pdf"
                className="hidden"
                onChange={(e) => {
                  setImportFile(e.target.files?.[0] ?? null);
                  setImportResult(null);
                  setImportError("");
                }}
              />
            </div>

            {importError && <div className={`${alertErrorClass} mb-4`}>{importError}</div>}

            {importResult && (
              <div className="mb-4 rounded-xl border border-purple-100 bg-purple-50 px-4 py-3 text-sm">
                <p className="font-black text-[#130824]">
                  Import complete — {importResult.created} created, {importResult.updated} updated
                </p>
                {importResult.errors.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {importResult.errors.map((e) => (
                      <li key={e.row} className="text-red-700">
                        Row {e.row}: {e.message}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleImport}
                disabled={!importFile || importing}
                className={`${buttonPrimary} flex-1`}
              >
                {importing ? "Importing..." : "Import"}
              </button>
              <button
                type="button"
                onClick={() => setShowImport(false)}
                className={`${buttonSecondary} flex-1`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
