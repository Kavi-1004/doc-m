import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { renderToBuffer } from "@react-pdf/renderer";
import { QuotationPDF } from "@/lib/pdf/quotation-pdf";
import path from "path";
import { stat } from "fs/promises";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { searchParams } = new URL(request.url);
  const hidePrices = searchParams.get("hidePrices") === "true";

  const { id } = await params;
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

  // Resolve logo path for PDF generator
  let logoUrl = quotation.company.logoUrl;
  if (logoUrl && logoUrl.startsWith("/api/upload/")) {
    const filename = logoUrl.replace("/api/upload/", "");
    const absolutePath = path.join(process.cwd(), "uploads", filename);
    try {
      await stat(absolutePath);
      logoUrl = absolutePath;
    } catch (e) {
      logoUrl = null;
    }
  } else if (logoUrl && !logoUrl.startsWith("http")) {
    // If it's a relative path to public, resolve it
    logoUrl = path.join(process.cwd(), "public", logoUrl);
  }

  const pdfData = {
    quotationNumber: quotation.quotationNumber,
    title: quotation.title,
    date: quotation.date.toISOString().split("T")[0],
    company: {
      ...quotation.company,
      logoUrl,
    },
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
    currency: quotation.currency,
    isComputerGenerated: quotation.isComputerGenerated,
    validity: quotation.validity,
    salesPerson: quotation.salesPerson,
    salesPhone: quotation.salesPhone,
    salesEmail: quotation.salesEmail,
  };

  const buffer = await renderToBuffer(
    QuotationPDF({ data: pdfData, hidePrices })
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${quotation.quotationNumber}.pdf"`,
    },
  });
}
