"use client";

import { useState, useEffect } from "react";
import { Receipt, Search, Plus, Trash2, Eye, Download, Mail, Loader2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/Toast";

interface Invoice {
  id: string;
  invoiceNumber: string;
  status: string;
  grandTotal: number;
  date: string;
  dueDate: string | null;
  company: { name: string; shortCode: string };
  customer: { name: string };
}

const statusColors: Record<string, string> = {
  UNPAID: "bg-yellow-100 text-yellow-700",
  PARTIALLY_PAID: "bg-blue-100 text-blue-700",
  PAID: "bg-green-100 text-green-700",
  OVERDUE: "bg-red-100 text-red-700",
  CANCELLED: "bg-gray-100 text-gray-700",
};

export default function InvoicesPage() {
  const { showToast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [emailError, setEmailError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    fetch(`/api/invoices?${params}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => { setInvoices(data); setLoading(false); })
      .catch((e) => { if (e?.name !== "AbortError") setLoading(false); });
    return () => controller.abort();
  }, [search, statusFilter, refreshKey]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this invoice?")) return;
    try {
      const res = await fetch(`/api/invoices/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        showToast(data?.error || "Failed to delete invoice", "error");
        return;
      }
      showToast("Invoice deleted", "success");
      setRefreshKey((k) => k + 1);
    } catch {
      showToast("An unexpected error occurred", "error");
    }
  }

  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailInvoiceId, setEmailInvoiceId] = useState("");
  const [emailTo, setEmailTo] = useState("");
  const [emailSending, setEmailSending] = useState(false);

  function handleEmailInvoice(id: string) {
    setEmailInvoiceId(id);
    setEmailTo("");
    setShowEmailDialog(true);
  }

  async function sendInvoiceEmail() {
    if (!emailTo || !emailInvoiceId) return;
    setEmailError("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTo)) {
      setEmailError("Please enter a valid email address");
      return;
    }
    setEmailSending(true);
    try {
      const res = await fetch(`/api/invoices/${emailInvoiceId}/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: emailTo }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Invoice email sent successfully!", "success");
        setShowEmailDialog(false);
      } else {
        setEmailError(data.error || "Failed to send email");
      }
    } catch {
      setEmailError("An unexpected error occurred");
    } finally {
      setEmailSending(false);
    }
  }

  async function handleStatusUpdate(id: string, status: string) {
    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, items: [] }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        showToast(data?.error || "Failed to update status", "error");
        return;
      }
      showToast("Invoice status updated", "success");
      setRefreshKey((k) => k + 1);
    } catch {
      showToast("An unexpected error occurred", "error");
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-600 mt-1">Manage invoices and payments</p>
        </div>
        <Link href="/invoices/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
          <Plus className="w-4 h-4" /> New Invoice
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search invoices..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Status</option>
          <option value="UNPAID">Unpaid</option>
          <option value="PARTIALLY_PAID">Partially Paid</option>
          <option value="PAID">Paid</option>
          <option value="OVERDUE">Overdue</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Invoice #</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Customer</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Date</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Due Date</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Total</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-16 text-center text-gray-500">
                  <Loader2 className="w-8 h-8 mx-auto mb-3 text-gray-300 animate-spin" />
                  <p className="text-sm text-gray-400">Loading invoices...</p>
                </td></tr>
              ) : invoices.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-16 text-center text-gray-500">
                  <Receipt className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="font-medium text-gray-600">No invoices found</p>
                  <p className="text-sm text-gray-400 mt-1">Create an invoice to track payments</p>
                  <Link href="/invoices/new" className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors">
                    <Plus className="w-4 h-4" /> New Invoice
                  </Link>
                </td></tr>
              ) : invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs font-medium text-gray-900">{inv.invoiceNumber}</td>
                  <td className="px-4 py-3 text-gray-900">{inv.customer.name}</td>
                  <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{new Date(inv.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "-"}</td>
                  <td className="px-4 py-3">
                    <select value={inv.status} onChange={(e) => handleStatusUpdate(inv.id, e.target.value)}
                      className={`px-2 py-1 rounded text-xs font-medium border-0 cursor-pointer ${statusColors[inv.status] || ""}`}>
                      <option value="UNPAID">Unpaid</option>
                      <option value="PARTIALLY_PAID">Partially Paid</option>
                      <option value="PAID">Paid</option>
                      <option value="OVERDUE">Overdue</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">
                    ${inv.grandTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/invoices/new?id=${inv.id}`} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded" title="View">
                        <Eye className="w-4 h-4" />
                      </Link>
                      <a href={`/api/invoices/${inv.id}/pdf`} target="_blank" rel="noreferrer" className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded" title="Download PDF">
                        <Download className="w-4 h-4" />
                      </a>
                      <button onClick={() => handleEmailInvoice(inv.id)} className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded" title="Email Invoice">
                        <Mail className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(inv.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showEmailDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Email Invoice</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Email *</label>
                <input type="email" value={emailTo} onChange={(e) => { setEmailTo(e.target.value); setEmailError(""); }}
                  placeholder="recipient@example.com"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${emailError ? "border-red-400" : "border-gray-300"}`} />
                {emailError && <p className="text-xs text-red-600 mt-1">{emailError}</p>}
              </div>
              <p className="text-xs text-gray-500">The invoice PDF will be attached automatically.</p>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowEmailDialog(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={sendInvoiceEmail} disabled={!emailTo || emailSending}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                {emailSending ? "Sending..." : "Send Email"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
