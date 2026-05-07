import React from "react";

interface InvoiceItem {
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

interface Company {
  name: string;
  shortCode?: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  logoUrl?: string | null;
  taxId?: string | null;
  bankName?: string | null;
  bankAccount?: string | null;
  bankBranch?: string | null;
  swiftCode?: string | null;
}

interface Customer {
  name: string;
  contactPerson?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
}

interface Props {
  company: Company | null;
  customer: Customer | null;
  invoiceNumber: string;
  date: string;
  dueDate?: string | null;
  quotationNumber?: string | null;
  doNumber?: string | null;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  taxRate: number;
  taxAmount: number;
  grandTotal: number;
  footer?: string | null;
}

function fmt(n: number): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function InvoicePreview({
  company,
  customer,
  invoiceNumber,
  date,
  dueDate,
  quotationNumber,
  doNumber,
  items,
  subtotal,
  discount,
  taxRate,
  taxAmount,
  grandTotal,
  footer,
}: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 text-sm print:shadow-none print:border-none print:p-0 font-sans text-black">
      {/* Header */}
      <div className="flex justify-between items-end mb-1">
        <div className="w-20">
          <img src={company?.logoUrl || "/logo.jpeg"} alt="logo" className="w-12 h-12 object-contain" />
        </div>
        <div className="flex-1 text-center">
          <h2 className="text-xl font-bold text-black tracking-tight">
            {company?.name || "company name"}
          </h2>
          {company?.address && (
            <p className="text-black text-xs mt-0.5 whitespace-pre-line">{company.address}</p>
          )}
          <p className="text-black text-xs">
            {company?.email || "company mail"} | {company?.shortCode ? `${company.shortCode}.com` : "website"}
          </p>
        </div>
        <div className="w-40 text-right">
          <p className="text-[10px] font-bold uppercase">REG NO: {company?.taxId || "202102151N"}</p>
        </div>
      </div>
      
      <div className="border-b-2 border-black mb-6"></div>

      {/* To & Info Section */}
      <div className="flex justify-between mb-8">
        <div className="w-[55%] space-y-6">
          <div className="flex">
            <span className="w-20 font-bold">BILL TO:</span>
            <div className="flex-1">
              {customer?.contactPerson && <p className="text-black font-medium">{customer.contactPerson}</p>}
              {customer?.name && <p className="text-black font-medium">{customer.name}</p>}
              {customer?.address && <p className="text-black whitespace-pre-line">{customer.address}</p>}
            </div>
          </div>
          
          <div className="flex pt-4">
            <span className="w-20 font-bold">ATTN:</span>
            <div className="flex-1">
              {customer?.contactPerson && <p className="text-black font-medium">{customer.contactPerson}</p>}
              {customer?.email && <p className="text-black">{customer.email}</p>}
              {customer?.phone && <p className="text-black">{customer.phone}</p>}
            </div>
          </div>
        </div>

        <div className="w-[40%] border-2 border-black">
          <div className="bg-white border-b-2 border-black p-1 text-center">
            <h3 className="text-xs font-bold uppercase">Invoice</h3>
          </div>
          <div className="p-2 space-y-1 text-[11px]">
            <div className="flex">
              <span className="w-1/2 font-bold">INVOICE NO:</span>
              <span className="w-1/2">{invoiceNumber}</span>
            </div>
            <div className="flex">
              <span className="w-1/2 font-bold">DATE:</span>
              <span className="w-1/2">{date}</span>
            </div>
            {dueDate && (
              <div className="flex">
                <span className="w-1/2 font-bold">DUE DATE:</span>
                <span className="w-1/2">{dueDate}</span>
              </div>
            )}
            {quotationNumber && (
              <div className="flex">
                <span className="w-1/2 font-bold">QUOTATION REF:</span>
                <span className="w-1/2">{quotationNumber}</span>
              </div>
            )}
            {doNumber && (
              <div className="flex">
                <span className="w-1/2 font-bold">DO REF:</span>
                <span className="w-1/2">{doNumber}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Document Title */}
      <div className="text-center mb-6">
        <h3 className="text-sm font-bold uppercase underline decoration-1 underline-offset-4">
          INVOICE
        </h3>
      </div>

      {/* Items Table */}
      <div className="border border-black overflow-hidden mb-0">
        <table className="w-full text-[11px] border-collapse">
          <thead>
            <tr className="border-b border-black">
              <th className="w-[8%] border-r border-black p-1 font-bold text-center">NO</th>
              <th className="w-[42%] border-r border-black p-1 font-bold text-center">DESCRIPTION</th>
              <th className="w-[12%] border-r border-black p-1 font-bold text-center">QTY</th>
              <th className="w-[12%] border-r border-black p-1 font-bold text-center">UNIT</th>
              <th className="w-[13%] border-r border-black p-1 font-bold text-center">U. PRICE</th>
              <th className="w-[13%] p-1 font-bold text-center">TOTAL</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black">
            {items.map((item, i) => (
              <tr key={i} className="min-h-[40px]">
                <td className="border-r border-black p-1 text-center align-top">{i + 1}</td>
                <td className="border-r border-black p-1 align-top">
                  <div className="font-bold uppercase">
                    {item.description || "-"}
                  </div>
                </td>
                <td className="border-r border-black p-1 text-center align-top font-medium">
                  {item.quantity}
                </td>
                <td className="border-r border-black p-1 text-center align-top whitespace-nowrap">
                  {item.unit}
                </td>
                <td className="border-r border-black p-1 text-right align-top">
                  {fmt(item.unitPrice)}
                </td>
                <td className="p-1 text-right align-top font-bold">
                  {fmt(item.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals Section */}
      <div className="flex justify-end mt-2 mb-8">
        <div className="w-[40%] text-[11px]">
          <div className="flex justify-between py-1">
            <span className="font-bold">SUBTOTAL</span>
            <span>{fmt(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between py-1 text-red-600">
              <span className="font-bold">DISCOUNT</span>
              <span>-{fmt(discount)}</span>
            </div>
          )}
          {taxRate > 0 && (
            <div className="flex justify-between py-1">
              <span className="font-bold">TAX ({taxRate}%)</span>
              <span>{fmt(taxAmount)}</span>
            </div>
          )}
          <div className="flex justify-between py-2 mt-1 border-t-2 border-black">
            <span className="font-bold text-xs">GRAND TOTAL</span>
            <span className="font-bold text-xs">{fmt(grandTotal)}</span>
          </div>
        </div>
      </div>

      {/* Payment Information */}
      <div className="mt-8 border border-black p-4 bg-gray-50/50 rounded">
        <h4 className="text-[11px] font-bold uppercase mb-2">Payment Details</h4>
        <div className="grid grid-cols-2 gap-2 text-[10px]">
          {company?.bankName && <div><span className="font-bold">Bank Name:</span> {company.bankName}</div>}
          {company?.bankAccount && <div><span className="font-bold">Account No:</span> {company.bankAccount}</div>}
          {company?.bankBranch && <div><span className="font-bold">Branch:</span> {company.bankBranch}</div>}
          {company?.swiftCode && <div><span className="font-bold">Swift Code:</span> {company.swiftCode}</div>}
        </div>
      </div>

      {/* Notes section */}
      {footer && (
        <div className="mt-6">
          <p className="text-[10px] whitespace-pre-wrap mt-1">{footer}</p>
        </div>
      )}

      {/* Signatures */}
      <div className="flex justify-end mt-12 mb-20">
        <div className="w-1/2 p-4 min-h-[120px] flex flex-col justify-end items-center">
          <div className="w-full border-t border-black border-dashed mb-1"></div>
          <p className="text-[10px] font-bold">Authorised Signature</p>
          <p className="text-[9px] font-bold uppercase">(FOR {company?.name || "Company"})</p>
        </div>
      </div>

      <div className="text-center mb-8">
        <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500">
          This is a computer generated copy. No signature required.
        </p>
      </div>

      {/* Footer */}
      <div className="border-t border-black pt-4 text-center">
        <p className="text-black text-xs font-medium uppercase">
          {company?.name || "company name"} || {company?.shortCode ? `${company.shortCode}.com` : "website"}
        </p>
      </div>
    </div>
  );
}
