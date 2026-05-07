import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createLog } from "@/lib/log";
import { sendEmail, escapeHtml } from "@/lib/email";
import { renderToBuffer } from "@react-pdf/renderer";
import { InvoicePDF } from "@/lib/pdf/invoice-pdf";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { to, subject, message } = body;

  if (!to) {
    return NextResponse.json({ error: "Recipient email is required" }, { status: 400 });
  }

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

  const pdfBuffer = await renderToBuffer(
    InvoicePDF({ data: pdfData })
  );

  const emailSubject = subject || `Invoice ${invoice.invoiceNumber} from ${invoice.company.name}`;
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Invoice ${escapeHtml(invoice.invoiceNumber)}</h2>
      <p>Dear ${escapeHtml(invoice.customer.contactPerson || invoice.customer.name)},</p>
      ${message ? `<p>${escapeHtml(message)}</p>` : `<p>Please find attached the invoice from ${escapeHtml(invoice.company.name)}.</p>`}
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <tr style="background: #f9fafb;">
          <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Invoice #</td>
          <td style="padding: 8px; border: 1px solid #e5e7eb;">${escapeHtml(invoice.invoiceNumber)}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Date</td>
          <td style="padding: 8px; border: 1px solid #e5e7eb;">${invoice.date.toISOString().split("T")[0]}</td>
        </tr>
        ${invoice.dueDate ? `
        <tr style="background: #f9fafb;">
          <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Due Date</td>
          <td style="padding: 8px; border: 1px solid #e5e7eb;">${invoice.dueDate.toISOString().split("T")[0]}</td>
        </tr>` : ""}
        <tr>
          <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Grand Total</td>
          <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold; color: #dc2626;">$${invoice.grandTotal.toFixed(2)}</td>
        </tr>
      </table>
      <p style="color: #6b7280; font-size: 12px;">This is an automated email. The invoice PDF is attached.</p>
    </div>
  `;

  const result = await sendEmail({
    to,
    subject: emailSubject,
    html: emailHtml,
    attachments: [
      {
        filename: `${invoice.invoiceNumber}.pdf`,
        content: Buffer.from(pdfBuffer),
        contentType: "application/pdf",
      },
    ],
  });

  if (result.success) {
    await createLog("EDITED", "Invoice", id, session.id, `Emailed invoice ${invoice.invoiceNumber} to ${to}`);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ success: false, error: result.error }, { status: 500 });
}
