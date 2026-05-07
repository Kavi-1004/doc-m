"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Save, Printer, ArrowLeft, Loader2, Download, Mail } from "lucide-react";
import Link from "next/link";
import QuotationPreview from "./QuotationPreview";
import { useToast } from "@/components/ui/Toast";

interface QuotationItem {
  id?: string;
  description: string;
  details?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
  sortOrder: number;
}

interface Company {
  id: string;
  name: string;
  shortCode: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  logoUrl: string | null;
  taxId: string | null;
  taxRate: number | null;
}

interface Customer {
  id: string;
  name: string;
  contactPerson: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
}

interface Props {
  quotationId?: string;
}

export default function QuotationEditor({ quotationId }: Props) {
  const router = useRouter();
  const { showToast } = useToast();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [companyId, setCompanyId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("DRAFT");
  const [items, setItems] = useState<QuotationItem[]>([
    { description: "", quantity: 1, unit: "pcs", unitPrice: 0, total: 0, sortOrder: 0 },
  ]);
  const [discount, setDiscount] = useState(0);
  const [taxRate, setTaxRate] = useState(0);
  const [terms, setTerms] = useState("");
  const [warranty, setWarranty] = useState("");
  const [footer, setFooter] = useState("");
  const [quotationNumber, setQuotationNumber] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [currency, setCurrency] = useState("LKR");
  const [isComputerGenerated, setIsComputerGenerated] = useState(false);
  const [validity, setValidity] = useState("30 DAYS");
  const [salesPerson, setSalesPerson] = useState("-");
  const [salesPhone, setSalesPhone] = useState("-");
  const [salesEmail, setSalesEmail] = useState("-");

  const selectedCompany = companies.find((c) => c.id === companyId);
  const selectedCustomer = customers.find((c) => c.id === customerId);

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = (subtotal - discount) * (taxRate / 100);
  const grandTotal = subtotal - discount + taxAmount;

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const fetches: Promise<unknown>[] = [
      fetch("/api/companies", { signal: controller.signal }).then((r) => r.json()),
      fetch("/api/customers", { signal: controller.signal }).then((r) => r.json()),
    ];
    if (quotationId) {
      fetches.push(
        fetch(`/api/quotations/${quotationId}`, { signal: controller.signal })
          .then((r) => r.ok ? r.json() : null)
      );
    }
    Promise.all(fetches)
      .then((results) => {
        const [c, cu, q] = results as [Company[], Customer[], Record<string, unknown> | undefined];
        setCompanies(c);
        setCustomers(cu);
        if (q) {
          setCompanyId(q.companyId as string);
          setCustomerId(q.customerId as string);
          setTitle((q.title as string) || "");
          setStatus(q.status as string);
          setItems(
            (q.items as QuotationItem[]).map((item: QuotationItem) => ({
              ...item,
              total: item.quantity * item.unitPrice,
            }))
          );
          setDiscount(q.discount as number);
          setTaxRate(q.taxRate as number);
          setTerms((q.terms as string) || "");
          setWarranty((q.warranty as string) || "");
          setFooter((q.footer as string) || "");
          setQuotationNumber(q.quotationNumber as string);
          setDate((q.date as string).split("T")[0]);
          setCurrency((q.currency as string) || "LKR");
          setIsComputerGenerated(!!q.isComputerGenerated);
          setValidity((q.validity as string) || "30 DAYS");
          setSalesPerson((q.salesPerson as string) || "-");
          setSalesPhone((q.salesPhone as string) || "-");
          setSalesEmail((q.salesEmail as string) || "-");
        }
        setLoading(false);
      })
      .catch((e: Error) => {
        if (e?.name !== "AbortError") setLoading(false);
      });
    return () => controller.abort();
  }, [quotationId, refreshKey]);

  useEffect(() => {
    if (!quotationId && companyId) {
      fetch(`/api/quotations/next-number?companyId=${companyId}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.nextNumber) setQuotationNumber(data.nextNumber);
        });
    }
  }, [companyId, quotationId]);

  function updateItem(index: number, field: keyof QuotationItem, value: string | number) {
    const newItems = [...items];
    const item = { ...newItems[index], [field]: value };
    if (field === "quantity" || field === "unitPrice") {
      item.total = Number(item.quantity) * Number(item.unitPrice);
    }
    newItems[index] = item;
    setItems(newItems);
  }

  function addItem() {
    setItems([
      ...items,
      { description: "", details: "", quantity: 1, unit: "pcs", unitPrice: 0, total: 0, sortOrder: items.length },
    ]);
  }

  function removeItem(index: number) {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  }

  async function handleSave(saveStatus?: string) {
    const newErrors: Record<string, string> = {};
    if (!companyId) newErrors.companyId = "Company is required";
    if (!customerId) newErrors.customerId = "Customer is required";
    const hasEmptyItems = items.some((item) => !item.description.trim());
    if (hasEmptyItems) newErrors.items = "All items must have a description";
    if (discount < 0) newErrors.discount = "Discount cannot be negative";
    if (taxRate < 0 || taxRate > 100) newErrors.taxRate = "Tax rate must be between 0 and 100";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    setSaving(true);
    try {
      const payload = {
        companyId,
        customerId,
        title,
        status: saveStatus || status,
        items: items.map((item, i) => ({ ...item, sortOrder: i })),
        discount,
        taxRate,
        currency,
        isComputerGenerated,
        validity,
        salesPerson,
        salesPhone,
        salesEmail,
        terms,
        warranty,
        footer,
      };

      const method = quotationId ? "PUT" : "POST";
      const url = quotationId ? `/api/quotations/${quotationId}` : "/api/quotations";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        if (!quotationId) {
          router.push(`/quotations/${data.id}/edit`);
        } else {
          setRefreshKey((k) => k + 1);
          showToast("Quotation saved successfully!", "success");
        }
      } else {
        const err = await res.json().catch(() => null);
        showToast(err?.error || `Server Error (${res.status})`, "error");
      }
    } catch {
      showToast("An unexpected error occurred while saving.", "error");
    } finally {
      setSaving(false);
    }
  }

  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [emailSending, setEmailSending] = useState(false);

  function handleDownloadPDF() {
    if (!quotationId) return;
    window.open(`/api/quotations/${quotationId}/pdf`, "_blank");
  }

  const [emailError, setEmailError] = useState("");

  async function handleSendEmail() {
    if (!quotationId || !emailTo) return;
    setEmailError("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTo)) {
      setEmailError("Please enter a valid email address");
      return;
    }
    setEmailSending(true);
    try {
      const res = await fetch(`/api/quotations/${quotationId}/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: emailTo, subject: emailSubject, message: emailMessage }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Email sent successfully!", "success");
        setShowEmailDialog(false);
        setEmailTo("");
        setEmailSubject("");
        setEmailMessage("");
      } else {
        setEmailError(data.error || "Failed to send email");
      }
    } catch {
      setEmailError("An unexpected error occurred");
    } finally {
      setEmailSending(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 print:hidden">
        <div className="flex items-center gap-3">
          <Link href="/quotations" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {quotationId ? `Edit Quotation` : "New Quotation"}
            </h1>
            {quotationNumber && (
              <p className="text-sm text-gray-600 font-mono">{quotationNumber}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2 print:hidden">
          <button
            onClick={() => handleSave("DRAFT")}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> Save Draft
          </button>
          <button
            onClick={() => handleSave("SENT")}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> Save & Send
          </button>
          {quotationId && (
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium print:hidden"
            >
              <Download className="w-4 h-4" /> PDF
            </button>
          )}
          {quotationId && (
            <button
              onClick={() => {
                setEmailTo(selectedCustomer?.email || "");
                setShowEmailDialog(true);
              }}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium print:hidden"
            >
              <Mail className="w-4 h-4" /> Email
            </button>
          )}
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium print:hidden"
          >
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 print:block">
        {/* Left: Form Editor */}
        <div className="space-y-6 print:hidden">
          {/* Company & Customer Selection */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Document Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
                <select
                  value={companyId}
                  onChange={(e) => {
                    setCompanyId(e.target.value);
                    setErrors((prev) => { const next = { ...prev }; delete next.companyId; return next; });
                    const co = companies.find((c) => c.id === e.target.value);
                    if (co?.taxRate) setTaxRate(co.taxRate);
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.companyId ? "border-red-400" : "border-gray-300"}`}
                >
                  <option value="">Select company</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.shortCode})</option>
                  ))}
                </select>
                {errors.companyId && <p className="text-xs text-red-600 mt-1">{errors.companyId}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer *</label>
                <select
                  value={customerId}
                  onChange={(e) => { setCustomerId(e.target.value); setErrors((prev) => { const next = { ...prev }; delete next.customerId; return next; }); }}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.customerId ? "border-red-400" : "border-gray-300"}`}
                >
                  <option value="">Select customer</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {errors.customerId && <p className="text-xs text-red-600 mt-1">{errors.customerId}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Quotation title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <input
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                  placeholder="e.g. LKR, USD"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="isComputerGenerated"
                  checked={isComputerGenerated}
                  onChange={(e) => setIsComputerGenerated(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isComputerGenerated" className="text-sm font-medium text-gray-700">
                  Computer Generated Copy
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Validity</label>
                <input value={validity} onChange={(e) => setValidity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sales Person</label>
                <input value={salesPerson} onChange={(e) => setSalesPerson(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sales Tel</label>
                <input value={salesPhone} onChange={(e) => setSalesPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sales Email</label>
                <input value={salesEmail} onChange={(e) => setSalesEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Items</h2>
              <button
                onClick={addItem}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 print:hidden"
              >
                <Plus className="w-4 h-4" /> Add Item
              </button>
            </div>
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="space-y-2 p-3 bg-white border border-gray-100 rounded-xl shadow-sm">
                  <div className="grid grid-cols-12 gap-3 items-start">
                    <div className="col-span-12 md:col-span-5">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Item Name</label>
                      <input
                        placeholder="e.g. CONTROL PANEL"
                        value={item.description}
                        onChange={(e) => updateItem(index, "description", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                      />
                    </div>
                    <div className="col-span-12 md:col-span-7">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Components / Details</label>
                      <textarea
                        placeholder="Enter components or detailed description..."
                        rows={2}
                        value={item.details || ""}
                        onChange={(e) => updateItem(index, "details", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-12 gap-3 items-center pt-2 border-t border-gray-50">
                    <div className="col-span-3">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Qty</label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, "quantity", parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div className="col-span-3">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Unit</label>
                      <input
                        value={item.unit}
                        onChange={(e) => updateItem(index, "unit", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div className="col-span-3">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Price</label>
                      <input
                        type="number"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(index, "unitPrice", parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div className="col-span-2 text-right">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Total</label>
                      <span className="text-sm font-bold text-blue-600">{currency} {item.total.toLocaleString()}</span>
                    </div>
                    <div className="col-span-1 text-right pt-4">
                      <button onClick={() => removeItem(index)} className="text-gray-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Totals</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.discount ? "border-red-400" : "border-gray-300"}`}
                />
                {errors.discount && <p className="text-xs text-red-600 mt-1">{errors.discount}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.taxRate ? "border-red-400" : "border-gray-300"}`}
                />
                {errors.taxRate && <p className="text-xs text-red-600 mt-1">{errors.taxRate}</p>}
              </div>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Subtotal:</span><span className="font-medium">${subtotal.toFixed(2)}</span></div>
              {discount > 0 && <div className="flex justify-between"><span className="text-gray-600">Discount:</span><span className="font-medium text-red-600">-${discount.toFixed(2)}</span></div>}
              {taxRate > 0 && <div className="flex justify-between"><span className="text-gray-600">Tax ({taxRate}%):</span><span className="font-medium">${taxAmount.toFixed(2)}</span></div>}
              <div className="flex justify-between text-lg font-bold border-t pt-2"><span>Grand Total:</span><span>${grandTotal.toFixed(2)}</span></div>
            </div>
          </div>

          {/* Terms & Notes */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Terms & Notes</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Terms & Conditions</label>
                <textarea value={terms} onChange={(e) => setTerms(e.target.value)}
                  rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Warranty</label>
                <textarea value={warranty} onChange={(e) => setWarranty(e.target.value)}
                  rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Footer Note</label>
                <textarea value={footer} onChange={(e) => setFooter(e.target.value)}
                  rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Live Preview */}
        <div className="print:w-full">
          <div className="sticky top-8">
            <h2 className="text-lg font-semibold mb-4 print:hidden">Live Preview</h2>
            <QuotationPreview
              company={selectedCompany || null}
              customer={selectedCustomer || null}
              quotationNumber={quotationNumber || "Q-XXXX"}
              title={title}
              date={date}
              items={items}
              subtotal={subtotal}
              discount={discount}
              taxRate={taxRate}
              taxAmount={taxAmount}
              grandTotal={grandTotal}
              currency={currency}
              isComputerGenerated={isComputerGenerated}
              validity={validity}
              salesPerson={salesPerson}
              salesPhone={salesPhone}
              salesEmail={salesEmail}
              terms={terms}
              warranty={warranty}
              footer={footer}
            />
          </div>
        </div>
      </div>

      {showEmailDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 print:hidden">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Email Quotation</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To *</label>
                <input type="email" value={emailTo} onChange={(e) => { setEmailTo(e.target.value); setEmailError(""); }}
                  placeholder="recipient@example.com"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${emailError ? "border-red-400" : "border-gray-300"}`} />
                {emailError && <p className="text-xs text-red-600 mt-1">{emailError}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject (optional)</label>
                <input value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Auto-generated if empty"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message (optional)</label>
                <textarea value={emailMessage} onChange={(e) => setEmailMessage(e.target.value)}
                  rows={3} placeholder="Additional message..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <p className="text-xs text-gray-500">The quotation PDF will be attached automatically.</p>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowEmailDialog(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={handleSendEmail} disabled={!emailTo || emailSending}
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
