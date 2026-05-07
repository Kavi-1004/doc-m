import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createLog } from "@/lib/log";
import { sendEmail, escapeHtml } from "@/lib/email";
import { renderToBuffer } from "@react-pdf/renderer";
import { QuotationPDF } from "@/lib/pdf/quotation-pdf";

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

  const quotation = await prisma.quotation.findUnique({
    where: { id },
    include: {
      company: true,
      customer: true,
      items: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!quotation) {
    return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
  }

  const pdfData = {
    quotationNumber: quotation.quotationNumber,
    title: quotation.title,
    date: quotation.date.toISOString().split("T")[0],
    company: quotation.company,
    customer: quotation.customer,
    items: quotation.items.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unit: item.unit,
      unitPrice: item.unitPrice,
      total: item.total,
    })),
    subtotal: quotation.subtotal,
    discount: quotation.discount,
    taxRate: quotation.taxRate,
    taxAmount: quotation.taxAmount,
    grandTotal: quotation.grandTotal,
    terms: quotation.terms,
    warranty: quotation.warranty,
    footer: quotation.footer,
  };

  const pdfBuffer = await renderToBuffer(
    QuotationPDF({ data: pdfData })
  );

  const emailSubject = subject || `Quotation ${quotation.quotationNumber} from ${quotation.company.name}`;
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Quotation ${escapeHtml(quotation.quotationNumber)}</h2>
      <p>Dear ${escapeHtml(quotation.customer.contactPerson || quotation.customer.name)},</p>
      ${message ? `<p>${escapeHtml(message)}</p>` : `<p>Please find attached the quotation from ${escapeHtml(quotation.company.name)}.</p>`}
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <tr style="background: #f9fafb;">
          <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Quotation #</td>
          <td style="padding: 8px; border: 1px solid #e5e7eb;">${escapeHtml(quotation.quotationNumber)}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Date</td>
          <td style="padding: 8px; border: 1px solid #e5e7eb;">${quotation.date.toISOString().split("T")[0]}</td>
        </tr>
        <tr style="background: #f9fafb;">
          <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold;">Grand Total</td>
          <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: bold; color: #2563eb;">$${quotation.grandTotal.toFixed(2)}</td>
        </tr>
      </table>
      <p style="color: #6b7280; font-size: 12px;">This is an automated email. The quotation PDF is attached.</p>
    </div>
  `;

  const result = await sendEmail({
    to,
    subject: emailSubject,
    html: emailHtml,
    attachments: [
      {
        filename: `${quotation.quotationNumber}.pdf`,
        content: Buffer.from(pdfBuffer),
        contentType: "application/pdf",
      },
    ],
  });

  if (result.success) {
    await createLog("EDITED", "Quotation", id, session.id, `Emailed quotation ${quotation.quotationNumber} to ${to}`);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ success: false, error: result.error }, { status: 500 });
}
