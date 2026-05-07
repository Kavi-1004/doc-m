import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { renderToBuffer } from "@react-pdf/renderer";
import { DeliveryOrderPDF } from "@/lib/pdf/delivery-order-pdf";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const deliveryOrder = await prisma.deliveryOrder.findUnique({
    where: { id },
    include: {
      company: true,
      customer: true,
      quotation: { select: { quotationNumber: true, title: true } },
      purchaseOrder: { select: { poNumber: true } },
      items: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!deliveryOrder) {
    return NextResponse.json({ error: "Delivery order not found" }, { status: 404 });
  }

  const pdfData = {
    doNumber: deliveryOrder.doNumber,
    deliveryDate: deliveryOrder.deliveryDate?.toISOString().split("T")[0] ?? null,
    company: deliveryOrder.company,
    customer: deliveryOrder.customer,
    items: deliveryOrder.items.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unit: item.unit,
    })),
    quotationNumber: deliveryOrder.quotation?.quotationNumber ?? null,
    quotationTitle: deliveryOrder.quotation?.title ?? null,
    poNumber: deliveryOrder.purchaseOrder?.poNumber ?? null,
    footer: deliveryOrder.footer,
  };

  const buffer = await renderToBuffer(
    DeliveryOrderPDF({ data: pdfData })
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${deliveryOrder.doNumber}.pdf"`,
    },
  });
}
