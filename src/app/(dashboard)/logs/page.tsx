"use client";

import { useState, useEffect } from "react";
import { ClipboardList } from "lucide-react";

interface Log {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  details: string | null;
  createdAt: string;
  user: { name: string; email: string } | null;
}

const actionColors: Record<string, string> = {
  CREATED: "bg-green-100 text-green-700",
  EDITED: "bg-blue-100 text-blue-700",
  DELETED: "bg-red-100 text-red-700",
  REVISED: "bg-yellow-100 text-yellow-700",
  UPLOADED: "bg-purple-100 text-purple-700",
};

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [entityFilter, setEntityFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams();
    if (entityFilter) params.set("entity", entityFilter);
    if (actionFilter) params.set("action", actionFilter);
    fetch(`/api/logs?${params}`, { signal: controller.signal })
      .then((r) => r.json())
      .then(setLogs)
      .catch(() => {});
    return () => controller.abort();
  }, [entityFilter, actionFilter]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
        <p className="text-gray-600 mt-1">Track all system activities</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <select value={entityFilter} onChange={(e) => setEntityFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Entities</option>
          <option value="Company">Company</option>
          <option value="Customer">Customer</option>
          <option value="Quotation">Quotation</option>
          <option value="PurchaseOrder">Purchase Order</option>
          <option value="DeliveryOrder">Delivery Order</option>
          <option value="Invoice">Invoice</option>
          <option value="Settings">Settings</option>
        </select>
        <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Actions</option>
          <option value="CREATED">Created</option>
          <option value="EDITED">Edited</option>
          <option value="DELETED">Deleted</option>
          <option value="REVISED">Revised</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Timestamp</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">User</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Action</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Entity</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                    <ClipboardList className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No logs found</p>
                  </td>
                </tr>
              ) : logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-600 text-xs">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-gray-900">{log.user?.name || "System"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${actionColors[log.action] || "bg-gray-100"}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-900">{log.entity}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs hidden md:table-cell">{log.details || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
