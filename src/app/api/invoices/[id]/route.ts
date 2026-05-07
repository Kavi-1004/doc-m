import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createLog } from "@/lib/log";

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
      quotation: true,
      purchaseOrder: true,
      deliveryOrder: true,
      items: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  return NextResponse.json(invoice);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  await prisma.invoiceItem.deleteMany({ where: { invoiceId: id } });

  const parsedItems = (body.items || []).map((item: { description: string; quantity: number; unit: string; unitPrice: number; sortOrder: number }) => ({
    description: item.description,
    quantity: item.quantity || 1,
    unit: item.unit || "pcs",
    unitPrice: item.unitPrice || 0,
    total: (item.quantity || 1) * (item.unitPrice || 0),
    sortOrder: item.sortOrder || 0,
  }));

  const subtotal = parsedItems.reduce((sum: number, item: { total: number }) => sum + item.total, 0);
  const discountAmount = body.discount || 0;
  const tax = body.taxRate || 0;
  const taxAmount = (subtotal - discountAmount) * (tax / 100);
  const grandTotal = subtotal - discountAmount + taxAmount;

  const invoice = await prisma.invoice.update({
    where: { id },
    data: {
      status: body.status,
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
      subtotal,
      discount: discountAmount,
      taxRate: tax,
      taxAmount,
      grandTotal,
      footer: body.footer,
      items: {
        create: parsedItems,
      },
    },
    include: {
      company: true,
      customer: true,
      items: { orderBy: { sortOrder: "asc" } },
    },
  });

  await createLog("EDITED", "Invoice", id, session.id, `Updated invoice: ${invoice.invoiceNumber}`);

  return NextResponse.json(invoice);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.invoice.delete({ where: { id } });
  await createLog("DELETED", "Invoice", id, session.id, "Deleted invoice");

  return NextResponse.json({ success: true });
}
