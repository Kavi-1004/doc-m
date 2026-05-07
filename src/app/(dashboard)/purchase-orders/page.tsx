"use client";

import { useState, useEffect, useRef } from "react";
import { Upload, Search, Plus, Trash2, FileDown, Loader2 } from "lucide-react";

interface PurchaseOrder {
  id: string;
  poNumber: string | null;
  status: string;
  fileUrl: string | null;
  fileName: string | null;
  notes: string | null;
  receivedDate: string;
  quotation: { quotationNumber: string; title: string | null };
  customer: { name: string };
}

interface Quotation {
  id: string;
  quotationNumber: string;
  title: string | null;
  customerId: string;
  customer: { name: string };
}

export default function PurchaseOrdersPage() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    poNumber: "",
    quotationId: "",
    customerId: "",
    fileUrl: "",
    fileName: "",
    notes: "",
  });

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/purchase-orders?search=${search}`, { signal: controller.signal })
      .then((r) => r.json())
      .then(setPurchaseOrders)
      .catch(() => {});
    fetch("/api/quotations?status=SENT", { signal: controller.signal })
      .then((r) => r.json())
      .then(setQuotations)
      .catch(() => {});
    return () => controller.abort();
  }, [search, refreshKey]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/purchase-orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setShowForm(false);
    setForm({ poNumber: "", quotationId: "", customerId: "", fileUrl: "", fileName: "", notes: "" });
    setRefreshKey((k) => k + 1);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this purchase order?")) return;
    await fetch(`/api/purchase-orders/${id}`, { method: "DELETE" });
    setRefreshKey((k) => k + 1);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        setForm((prev) => ({ ...prev, fileUrl: data.fileUrl, fileName: data.fileName }));
      } else {
        const err = await res.json();
        alert(`Upload failed: ${err.error || "Unknown error"}`);
      }
    } finally {
      setUploading(false);
    }
  }

  function onQuotationSelect(quotationId: string) {
    const q = quotations.find((q) => q.id === quotationId);
    setForm({
      ...form,
      quotationId,
      customerId: q?.customerId || "",
    });
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Purchase Orders</h1>
          <p className="text-gray-600 mt-1">Track customer purchase orders</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> Upload PO
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search purchase orders..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Upload Purchase Order</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Linked Quotation *</label>
              <select
                required
                value={form.quotationId}
                onChange={(e) => onQuotationSelect(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select quotation</option>
                {quotations.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.quotationNumber} - {q.customer.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PO Number</label>
              <input
                value={form.poNumber}
                onChange={(e) => setForm({ ...form, poNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload PO Document</label>
              <div className="flex items-center gap-3">
                <input ref={fileInputRef} type="file" accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                  onChange={handleFileUpload} className="hidden" />
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium disabled:opacity-50">
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {uploading ? "Uploading..." : "Choose File"}
                </button>
                {form.fileName && (
                  <span className="text-sm text-green-600 font-medium">{form.fileName}</span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">Accepted: PDF, PNG, JPG, DOC, DOCX (max 10MB)</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                Upload PO
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">PO Number</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Quotation</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Customer</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Received</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {purchaseOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-gray-500">
                    <Upload className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="font-medium text-gray-600">No purchase orders found</p>
                    <p className="text-sm text-gray-400 mt-1">Upload a customer purchase order to track it</p>
                    <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors">
                      <Plus className="w-4 h-4" /> Upload PO
                    </button>
                  </td>
                </tr>
              ) : (
                purchaseOrders.map((po) => (
                  <tr key={po.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{po.poNumber || "-"}</td>
                    <td className="px-4 py-3 font-mono text-xs">{po.quotation.quotationNumber}</td>
                    <td className="px-4 py-3 text-gray-900">{po.customer.name}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">{po.status}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">
                      {new Date(po.receivedDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {po.fileUrl && (
                          <a href={po.fileUrl} target="_blank" rel="noreferrer" className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded">
                            <FileDown className="w-4 h-4" />
                          </a>
                        )}
                        <button onClick={() => handleDelete(po.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
