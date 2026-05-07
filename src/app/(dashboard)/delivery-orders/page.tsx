"use client";

import { useState, useEffect } from "react";
import { Truck, Search, Plus, Trash2, Eye, Download, Loader2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/Toast";

interface DeliveryOrder {
  id: string;
  doNumber: string;
  status: string;
  deliveryDate: string | null;
  company: { name: string; shortCode: string };
  customer: { name: string };
  quotation: { quotationNumber: string } | null;
  _count: { items: number };
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  DISPATCHED: "bg-blue-100 text-blue-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function DeliveryOrdersPage() {
  const { showToast } = useToast();
  const [deliveryOrders, setDeliveryOrders] = useState<DeliveryOrder[]>([]);
  const [search, setSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/delivery-orders?search=${search}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => { setDeliveryOrders(data); setLoading(false); })
      .catch((e) => { if (e?.name !== "AbortError") setLoading(false); });
    return () => controller.abort();
  }, [search, refreshKey]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this delivery order?")) return;
    try {
      const res = await fetch(`/api/delivery-orders/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        showToast(data?.error || "Failed to delete delivery order", "error");
        return;
      }
      showToast("Delivery order deleted", "success");
      setRefreshKey((k) => k + 1);
    } catch {
      showToast("An unexpected error occurred", "error");
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Delivery Orders</h1>
          <p className="text-gray-600 mt-1">Manage delivery orders</p>
        </div>
        <Link
          href="/delivery-orders/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> New Delivery Order
        </Link>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search delivery orders..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">DO Number</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Customer</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Quotation</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Delivery Date</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-gray-500">
                    <Loader2 className="w-8 h-8 mx-auto mb-3 text-gray-300 animate-spin" />
                    <p className="text-sm text-gray-400">Loading delivery orders...</p>
                  </td>
                </tr>
              ) : deliveryOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-gray-500">
                    <Truck className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="font-medium text-gray-600">No delivery orders found</p>
                    <p className="text-sm text-gray-400 mt-1">Create a delivery order from an approved quotation</p>
                    <Link href="/delivery-orders/new" className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors">
                      <Plus className="w-4 h-4" /> New Delivery Order
                    </Link>
                  </td>
                </tr>
              ) : (
                deliveryOrders.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs font-medium text-gray-900">{d.doNumber}</td>
                    <td className="px-4 py-3 text-gray-900">{d.customer.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600 hidden md:table-cell">
                      {d.quotation?.quotationNumber || "-"}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[d.status] || ""}`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">
                      {d.deliveryDate ? new Date(d.deliveryDate).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/delivery-orders/new?id=${d.id}`} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded" title="View">
                          <Eye className="w-4 h-4" />
                        </Link>
                        <a href={`/api/delivery-orders/${d.id}/pdf`} target="_blank" rel="noreferrer" className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded" title="Download PDF">
                          <Download className="w-4 h-4" />
                        </a>
                        <button onClick={() => handleDelete(d.id)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded" title="Delete">
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
