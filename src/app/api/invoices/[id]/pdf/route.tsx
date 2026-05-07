import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { renderToBuffer } from "@react-pdf/renderer";
import { InvoicePDF } from "@/lib/pdf/invoice-pdf";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      company: true,
      customer: true,
      quotation: { select: { quotationNumber: true } },
      deliveryOrder: { select: { doNumber: true } },
      items: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  const pdfData = {
    invoiceNumber: invoice.invoiceNumber,
    date: invoice.date.toISOString().split("T")[0],
    dueDate: invoice.dueDate?.toISOString().split("T")[0] ?? null,
    company: invoice.company,
    customer: invoice.customer,
    items: invoice.items.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unit: item.unit,
      unitPrice: item.unitPrice,
      total: item.total,
    })),
    subtotal: invoice.subtotal,
    discount: invoice.discount,
    taxRate: invoice.taxRate,
    taxAmount: invoice.taxAmount,
    grandTotal: invoice.grandTotal,
    quotationNumber: invoice.quotation?.quotationNumber ?? null,
    doNumber: invoice.deliveryOrder?.doNumber ?? null,
    footer: invoice.footer,
  };

  const buffer = await renderToBuffer(
    InvoicePDF({ data: pdfData })
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${invoice.invoiceNumber}.pdf"`,
    },
  });
}
