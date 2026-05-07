import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createLog } from "@/lib/log";
import { generateDocumentId } from "@/lib/id-generator";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { invoiceNumber: { contains: search, mode: "insensitive" } },
      { customer: { name: { contains: search, mode: "insensitive" } } },
    ];
  }
  if (status) {
    where.status = status;
  }

  const invoices = await prisma.invoice.findMany({
    where,
    include: {
      company: { select: { name: true, shortCode: true } },
      customer: { select: { name: true } },
      _count: { select: { items: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(invoices);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { companyId, customerId, quotationId, purchaseOrderId, deliveryOrderId, dueDate, items, discount, taxRate, footer, invoiceNumber: clientInvoiceNumber } = body;

  if (!companyId || !customerId) {
    return NextResponse.json(
      { error: "Company and customer are required" },
      { status: 400 }
    );
  }

  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  let invoiceNumber = clientInvoiceNumber;
  if (!invoiceNumber) {
    if (deliveryOrderId) {
      const doRec = await prisma.deliveryOrder.findUnique({ where: { id: deliveryOrderId } });
      if (doRec?.doNumber) {
        invoiceNumber = doRec.doNumber.replace("-DO-", "-I-").replace("-D-", "-I-");
      }
    }
    if (!invoiceNumber) {
      invoiceNumber = await generateDocumentId(company.shortCode, "I");
    }
  }

  const parsedItems = (items || []).map((item: { description: string; quantity: number; unit: string; unitPrice: number; sortOrder: number }) => ({
    description: item.description,
    quantity: item.quantity || 1,
    unit: item.unit || "pcs",
    unitPrice: item.unitPrice || 0,
    total: (item.quantity || 1) * (item.unitPrice || 0),
    sortOrder: item.sortOrder || 0,
  }));

  const subtotal = parsedItems.reduce((sum: number, item: { total: number }) => sum + item.total, 0);
  const discountAmount = discount || 0;
  const tax = taxRate || 0;
  const taxAmount = (subtotal - discountAmount) * (tax / 100);
  const grandTotal = subtotal - discountAmount + taxAmount;

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      companyId,
      customerId,
      quotationId,
      purchaseOrderId,
      deliveryOrderId,
      dueDate: dueDate ? new Date(dueDate) : null,
      subtotal,
      discount: discountAmount,
      taxRate: tax,
      taxAmount,
      grandTotal,
      footer,
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

  await createLog("CREATED", "Invoice", invoice.id, session.id, `Created invoice: ${invoiceNumber}`);

  return NextResponse.json(invoice, { status: 201 });
}
