"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Plus, Trash2, Printer, Download } from "lucide-react";
import Link from "next/link";
import DeliveryOrderPreview from "@/components/delivery-orders/DeliveryOrderPreview";

interface DOItem {
  description: string;
  quantity: number;
  unit: string;
  sortOrder: number;
}

interface Company { id: string; name: string; shortCode: string; }
interface Customer { id: string; name: string; }
interface Quotation { id: string; quotationNumber: string; customerId: string; companyId: string; items: { description: string; quantity: number; unit: string; }[]; }

export default function NewDeliveryOrderPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [saving, setSaving] = useState(false);

  const [doId, setDoId] = useState<string | null>(null);
  const [doNumber, setDoNumber] = useState("DO-XXXX");
  const [poNumber, setPoNumber] = useState<string | null>(null);
  const [status, setStatus] = useState("PENDING");

  const [companyId, setCompanyId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [quotationId, setQuotationId] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [footer, setFooter] = useState("");
  const [items, setItems] = useState<DOItem[]>([
    { description: "", quantity: 1, unit: "pcs", sortOrder: 0 },
  ]);

  const selectedCompany = companies.find((c) => c.id === companyId);
  const selectedCustomer = customers.find((c) => c.id === customerId);
  const selectedQuotation = quotations.find((q) => q.id === quotationId);

  useEffect(() => {
    const controller = new AbortController();
    const fetches: Promise<any>[] = [
      fetch("/api/companies", { signal: controller.signal }).then((r) => r.json()),
      fetch("/api/customers", { signal: controller.signal }).then((r) => r.json()),
      fetch("/api/quotations?status=APPROVED", { signal: controller.signal }).then((r) => r.json()),
    ];

    const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
    const existingId = searchParams?.get("id");

    if (existingId) {
      setDoId(existingId);
      fetches.push(fetch(`/api/delivery-orders/${existingId}`, { signal: controller.signal }).then(r => r.ok ? r.json() : null));
    }

    Promise.all(fetches)
      .then(([c, cu, q, d]) => {
        setCompanies(c);
        setCustomers(cu);
        setQuotations(q);
        if (d && d.id) {
          setCompanyId(d.companyId);
          setCustomerId(d.customerId);
          setQuotationId(d.quotationId || "");
          setDeliveryDate(d.deliveryDate ? d.deliveryDate.split("T")[0] : "");
          setFooter(d.footer || "");
          setItems(d.items || []);
          setDoNumber(d.doNumber);
          setPoNumber(d.purchaseOrder?.poNumber || null);
          setStatus(d.status);
        }
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!doId && companyId) {
      if (quotationId) {
        const q = quotations.find((q) => q.id === quotationId);
        if (q?.quotationNumber) {
          setDoNumber(q.quotationNumber.replace("-Q-", "-D-"));
        }
      } else {
        fetch(`/api/delivery-orders/next-number?companyId=${companyId}`)
          .then((r) => r.json())
          .then((data) => {
            if (data.nextNumber) setDoNumber(data.nextNumber);
          });
      }
    }
  }, [companyId, doId, quotationId, quotations]);

  function selectQuotation(qId: string) {
    setQuotationId(qId);
    const q = quotations.find((q) => q.id === qId);
    if (q) {
      setCompanyId(q.companyId);
      setCustomerId(q.customerId);
      if (q.items) {
        setItems(q.items.map((item, i) => ({
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          sortOrder: i,
        })));
      }
    }
  }

  function addItem() {
    setItems([...items, { description: "", quantity: 1, unit: "pcs", sortOrder: items.length }]);
  }

  function removeItem(i: number) {
    if (items.length <= 1) return;
    setItems(items.filter((_, idx) => idx !== i));
  }

  async function handleSave() {
    if (!companyId || !customerId) {
      alert("Please select company and customer");
      return;
    }
    setSaving(true);
    try {
      const method = doId ? "PUT" : "POST";
      const url = doId ? `/api/delivery-orders/${doId}` : "/api/delivery-orders";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doNumber, companyId, customerId, quotationId: quotationId || undefined,
          deliveryDate: deliveryDate || undefined, items, footer, status
        }),
      });
      if (res.ok) router.push("/delivery-orders");
    } finally {
      setSaving(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-6 print:hidden">
        <div className="flex items-center gap-3">
          <Link href="/delivery-orders" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{doId ? "Edit Delivery Order" : "New Delivery Order"}</h1>
            {doId && <p className="text-sm text-gray-600 font-mono">{doNumber}</p>}
          </div>
        </div>
        <div className="flex gap-2">
          {doId && (
            <a href={`/api/delivery-orders/${doId}/pdf`} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">
              <Download className="w-4 h-4" /> PDF
            </a>
          )}
          {doId && (
            <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">
              <Printer className="w-4 h-4" /> Print
            </button>
          )}
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50">
            <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Delivery Order"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 print:block">
        <div className="space-y-6 print:hidden">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Quotation</label>
              <div className="flex gap-2">
                <select value={quotationId} onChange={(e) => selectQuotation(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select (optional)</option>
                  {quotations.map((q) => <option key={q.id} value={q.id}>{q.quotationNumber}</option>)}
                </select>
                {quotationId && (
                  <a
                    href={`/api/quotations/${quotationId}/pdf?hidePrices=true`}
                    target="_blank"
                    className="flex items-center justify-center px-3 py-2 bg-gray-50 text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors whitespace-nowrap text-sm font-medium"
                    title="View Quotation without prices"
                  >
                    PDF (No Prices)
                  </a>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
              <select required value={companyId} onChange={(e) => setCompanyId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select company</option>
                {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer *</label>
              <select required value={customerId} onChange={(e) => setCustomerId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Select customer</option>
                {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Date</label>
              <input type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Items</h2>
            <button onClick={addItem} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100">
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
          <div className="space-y-3">
            {items.map((item, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-start">
                <div className="col-span-6">
                  <input placeholder="Description" value={item.description}
                    onChange={(e) => { const n = [...items]; n[i] = { ...n[i], description: e.target.value }; setItems(n); }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div className="col-span-2">
                  <input type="number" placeholder="Qty" value={item.quantity}
                    onChange={(e) => { const n = [...items]; n[i] = { ...n[i], quantity: parseFloat(e.target.value) || 0 }; setItems(n); }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div className="col-span-3">
                  <input placeholder="Unit" value={item.unit}
                    onChange={(e) => { const n = [...items]; n[i] = { ...n[i], unit: e.target.value }; setItems(n); }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div className="col-span-1 flex items-center justify-center pt-1">
                  <button onClick={() => removeItem(i)} className="p-1.5 text-gray-400 hover:text-red-600" disabled={items.length <= 1}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Footer Note</label>
          <textarea value={footer} onChange={(e) => setFooter(e.target.value)} rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        </div>
        
        {/* Right: Live Preview */}
        <div className="print:w-full">
          <div className="sticky top-8">
            <h2 className="text-lg font-semibold mb-4 print:hidden">Live Preview</h2>
            <DeliveryOrderPreview
              company={selectedCompany || null}
              customer={selectedCustomer || null}
              doNumber={doNumber}
              deliveryDate={deliveryDate}
              quotationNumber={selectedQuotation?.quotationNumber || null}
              quotationTitle={selectedQuotation?.title || null}
              poNumber={poNumber}
              items={items}
              footer={footer}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
