"use client";

import { useState, useEffect } from "react";
import { FileText, Plus, Search, Eye, Copy, RefreshCw, Trash2, Download } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Quotation {
  id: string;
  quotationNumber: string;
  title: string | null;
  status: string;
  grandTotal: number;
  date: string;
  company: { name: string; shortCode: string };
  customer: { name: string };
  _count: { items: number; purchaseOrders: number };
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  SENT: "bg-blue-100 text-blue-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  REVISED: "bg-yellow-100 text-yellow-700",
  EXPIRED: "bg-orange-100 text-orange-700",
};

export default function QuotationsPage() {
  const router = useRouter();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    fetch(`/api/quotations?${params}`, { signal: controller.signal })
      .then((r) => r.json())
      .then(setQuotations)
      .catch(() => {});
    return () => controller.abort();
  }, [search, statusFilter, refreshKey]);

  async function handleDuplicate(id: string) {
    await fetch(`/api/quotations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "duplicate" }),
    });
    setRefreshKey((k) => k + 1);
  }

  async function handleRevise(id: string) {
    const res = await fetch(`/api/quotations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "revise" }),
    });
    const data = await res.json();
    router.push(`/quotations/${data.id}/edit`);
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this quotation?")) return;
    await fetch(`/api/quotations/${id}`, { method: "DELETE" });
    setRefreshKey((k) => k + 1);
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quotations</h1>
          <p className="text-gray-600 mt-1">Manage quotations and proposals</p>
        </div>
        <Link
          href="/quotations/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> New Quotation
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search quotations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Status</option>
          <option value="DRAFT">Draft</option>
          <option value="SENT">Sent</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="REVISED">Revised</option>
          <option value="EXPIRED">Expired</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Quotation #</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Title</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Customer</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Date</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Total</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {quotations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="font-medium text-gray-600">No quotations found</p>
                    <p className="text-sm text-gray-400 mt-1">Create your first quotation to get started</p>
                    <Link href="/quotations/new" className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors">
                      <Plus className="w-4 h-4" /> New Quotation
                    </Link>
                  </td>
                </tr>
              ) : (
                quotations.map((q) => (
                  <tr key={q.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-medium text-gray-900">{q.quotationNumber}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{q.title || "-"}</td>
                    <td className="px-4 py-3 text-gray-900">{q.customer.name}</td>
                    <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">
                      {new Date(q.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[q.status] || "bg-gray-100"}`}>
                        {q.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      ${q.grandTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/quotations/${q.id}/edit`} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded" title="View/Edit">
                          <Eye className="w-4 h-4" />
                        </Link>
                        <a href={`/api/quotations/${q.id}/pdf`} target="_blank" rel="noreferrer" className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded" title="Download PDF">
                          <Download className="w-4 h-4" />
                        </a>
                        <button onClick={() => handleDuplicate(q.id)} className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded" title="Duplicate">
                          <Copy className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleRevise(q.id)} className="p-1.5 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded" title="Revise">
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(q.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded" title="Delete">
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
