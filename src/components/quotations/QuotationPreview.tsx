interface QuotationItem {
  description: string;
  details?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

interface Company {
  name: string;
  shortCode: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  logoUrl: string | null;
  taxId: string | null;
}

interface Customer {
  name: string;
  contactPerson: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
}

interface Props {
  company: Company | null;
  customer: Customer | null;
  quotationNumber: string;
  title: string;
  date: string;
  items: QuotationItem[];
  subtotal: number;
  discount: number;
  taxRate: number;
  taxAmount: number;
  grandTotal: number;
  currency: string;
  isComputerGenerated: boolean;
  validity: string;
  salesPerson: string;
  salesPhone: string;
  salesEmail: string;
  terms?: string;
  warranty?: string;
  footer?: string;
}

export default function QuotationPreview({
  company,
  customer,
  quotationNumber,
  title,
  date,
  items,
  subtotal,
  discount,
  taxRate,
  taxAmount,
  grandTotal,
  currency,
  isComputerGenerated,
  validity,
  salesPerson,
  salesPhone,
  salesEmail,
  terms,
  warranty,
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
            <span className="w-12 font-bold">TO:</span>
            <div className="flex-1">
              {customer?.contactPerson && <p className="text-black font-medium">{customer.contactPerson}</p>}
              {customer?.name && <p className="text-black font-medium">{customer.name}</p>}
              {customer?.address && <p className="text-black whitespace-pre-line">{customer.address}</p>}
            </div>
          </div>
          
          <div className="flex pt-4">
            <span className="w-12 font-bold">ATTN:</span>
            <div className="flex-1">
              {customer?.contactPerson && <p className="text-black font-medium">{customer.contactPerson}</p>}
              {customer?.email && <p className="text-black">{customer.email}</p>}
            </div>
          </div>
        </div>

        <div className="w-[40%] border-2 border-black">
          <div className="bg-white border-b-2 border-black p-1 text-center">
            <h3 className="text-xs font-bold uppercase">Quotation</h3>
          </div>
          <div className="p-2 space-y-1 text-[11px]">
            <div className="flex">
              <span className="w-1/2 font-bold">QUOTATION NO:</span>
              <span className="w-1/2">{quotationNumber}</span>
            </div>
            <div className="flex">
              <span className="w-1/2 font-bold">DATE:</span>
              <span className="w-1/2">{date}</span>
            </div>
            <div className="flex">
              <span className="w-1/2 font-bold">VALIDITY:</span>
              <span className="w-1/2">{validity}</span>
            </div>
            <div className="flex">
              <span className="w-1/2 font-bold">SALES:</span>
              <span className="w-1/2">{salesPerson}</span>
            </div>
            <div className="flex">
              <span className="w-1/2 font-bold">TEL:</span>
              <span className="w-1/2">{salesPhone}</span>
            </div>
            <div className="flex">
              <span className="w-1/2 font-bold">EMAIL:</span>
              <span className="w-1/2">{salesEmail}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Document Title */}
      {title && (
        <div className="text-center mb-6">
          <h3 className="text-sm font-bold uppercase underline decoration-1 underline-offset-4">
            QUOTATION FOR {title}
          </h3>
        </div>
      )}

      {/* Items Table */}
      <div className="border border-black overflow-hidden mb-0">
        <table className="w-full text-[11px] border-collapse">
          <thead>
            <tr className="border-b border-black">
              <th className="w-[8%] border-r border-black p-1 font-bold text-center">NO</th>
              <th className="w-[57%] border-r border-black p-1 font-bold text-center">ITEM/COMPONENTS</th>
              <th className="w-[12%] border-r border-black p-1 font-bold text-center">UNIT PRICE</th>
              <th className="w-[8%] border-r border-black p-1 font-bold text-center">QTY</th>
              <th className="w-[15%] p-1 font-bold text-center">SUB TOTAL</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black">
            {items.map((item, i) => (
              <tr key={i} className="min-h-[40px]">
                <td className="border-r border-black p-1 text-center align-top">{i + 1}</td>
                <td className="border-r border-black p-1 align-top">
                  <div className="font-bold mb-1 uppercase">
                    {item.description}
                  </div>
                  {item.details && (
                    <ul className="list-none space-y-0.5">
                      {item.details.split('\n').map((line, idx) => (
                        <li key={idx} className="pl-4 relative flex items-start">
                          <span className="mr-2 mt-1.5 w-1 h-1 bg-black rounded-full shrink-0"></span>
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </td>
                <td className="border-r border-black p-1 text-right align-top">
                  {item.unitPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </td>
                <td className="border-r border-black p-1 text-center align-top whitespace-nowrap">
                  {item.quantity} {item.unit}
                </td>
                <td className="p-1 text-right align-top font-medium">
                  {item.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
            {(discount > 0 || taxRate > 0) && (
              <>
                <tr className="border-t border-black">
                  <td colSpan={4} className="border-r border-black p-1 text-right font-bold uppercase tracking-wider">
                    SUBTOTAL
                  </td>
                  <td className="p-1 text-right font-medium">
                    {subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </td>
                </tr>
                {discount > 0 && (
                  <tr className="border-t border-black text-red-600">
                    <td colSpan={4} className="border-r border-black p-1 text-right font-bold uppercase tracking-wider">
                      LESS: DISCOUNT
                    </td>
                    <td className="p-1 text-right font-medium">
                      ({discount.toLocaleString("en-US", { minimumFractionDigits: 2 })})
                    </td>
                  </tr>
                )}
                {taxRate > 0 && (
                  <tr className="border-t border-black">
                    <td colSpan={4} className="border-r border-black p-1 text-right font-bold uppercase tracking-wider">
                      TAX ({taxRate}%)
                    </td>
                    <td className="p-1 text-right font-medium">
                      {taxAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                )}
              </>
            )}
            <tr className="border-t border-black font-bold bg-gray-50">
              <td colSpan={4} className="border-r border-black p-1 text-right font-bold uppercase tracking-wider">
                GRAND TOTAL ({currency})
              </td>
              <td className="p-1 text-right">
                {grandTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Notes section */}
      {(terms || warranty || footer) && (
        <div className="mt-6 space-y-4">
          {terms && (
            <div>
              <h4 className="text-[10px] font-bold uppercase underline">Terms & Conditions:</h4>
              <p className="text-[10px] whitespace-pre-wrap mt-1">{terms}</p>
            </div>
          )}
          {warranty && (
            <div>
              <h4 className="text-[10px] font-bold uppercase underline">Warranty:</h4>
              <p className="text-[10px] whitespace-pre-wrap mt-1">{warranty}</p>
            </div>
          )}
        </div>
      )}

      {/* Signatures */}
      <div className="flex justify-between mt-12 mb-20 gap-8">
        {/* Left: Always show acceptance box */}
        <div className="w-1/2 border-2 border-black p-4 min-h-[120px] flex flex-col justify-between">
          <h4 className="text-[10px] font-bold uppercase text-center">QUOTATION ACCEPTED BY:</h4>
          <div className="border-t border-black border-dashed pt-1 text-center">
            <p className="text-[9px] font-bold uppercase">NAME/SIGNATURE</p>
          </div>
        </div>

        {/* Right: Toggle between signature box and computer notice */}
        <div className="w-1/2">
          {isComputerGenerated ? (
            <div className="h-full flex items-center justify-center p-4 border-2 border-black border-dashed text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest leading-tight">
                This is a computer generated copy.<br />No signature required.
              </p>
            </div>
          ) : (
            <div className="h-full p-4 min-h-[120px] flex flex-col justify-end items-center">
              <div className="w-full border-t border-black border-dashed mb-1"></div>
              <p className="text-[10px] font-bold">Authorised Signature</p>
              <p className="text-[9px] font-bold uppercase">(FOR {company?.name})</p>
            </div>
          )}
        </div>
      </div>
      
      {footer && (
        <div className="mt-4 mb-8">
          <p className="text-[10px] font-bold uppercase italic">{footer}</p>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-black pt-4 text-center">
        <p className="text-black text-xs font-medium uppercase">
          {company?.name || "company name"} || {company?.shortCode ? `${company.shortCode}.com` : "website"}
        </p>
      </div>
    </div>
  );
}
