import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createLog } from "@/lib/log";
import { generateRevisionId } from "@/lib/id-generator";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const quotation = await prisma.quotation.findUnique({
    where: { id },
    include: {
      company: true,
      customer: true,
      items: { orderBy: { sortOrder: "asc" } },
      purchaseOrders: true,
      deliveryOrders: true,
      invoices: true,
    },
  });

  if (!quotation) {
    return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
  }

  return NextResponse.json(quotation);
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

  const parsedItems = (body.items || []).map((item: { description: string; details?: string; quantity: number; unit: string; unitPrice: number; sortOrder: number }) => ({
    description: item.description,
    details: item.details || "",
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

  const quotation = await prisma.$transaction(async (tx) => {
    // Delete existing items
    await tx.quotationItem.deleteMany({ where: { quotationId: id } });

    // Update quotation and create new items
    return tx.quotation.update({
      where: { id },
      data: {
        title: body.title,
        customerId: body.customerId,
        companyId: body.companyId,
        status: body.status,
        discount: discountAmount,
        taxRate: tax,
        taxAmount,
        subtotal,
        grandTotal,
        currency: body.currency,
        isComputerGenerated: body.isComputerGenerated,
        validity: body.validity,
        salesPerson: body.salesPerson,
        salesPhone: body.salesPhone,
        salesEmail: body.salesEmail,
        terms: body.terms,
        warranty: body.warranty,
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
  });

  await createLog("EDITED", "Quotation", id, session.id, `Updated quotation: ${quotation.quotationNumber}`);

  return NextResponse.json(quotation);
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
  const quotation = await prisma.quotation.findUnique({ where: { id } });

  try {
    await prisma.quotation.delete({ where: { id } });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2003") {
      return NextResponse.json(
        { error: "Cannot delete quotation with existing purchase orders, delivery orders, or invoices. Remove them first." },
        { status: 409 }
      );
    }
    throw error;
  }

  await createLog("DELETED", "Quotation", id, session.id, `Deleted quotation: ${quotation?.quotationNumber}`);

  return NextResponse.json({ success: true });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  if (body.action === "revise") {
    const original = await prisma.quotation.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!original) {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
    }

    const revisionNumber = original.revisionNumber + 1;
    const revisionId = generateRevisionId(original.quotationNumber, revisionNumber);

    const revision = await prisma.quotation.create({
      data: {
        quotationNumber: revisionId,
        companyId: original.companyId,
        customerId: original.customerId,
        title: original.title,
        status: "DRAFT",
        discount: original.discount,
        taxRate: original.taxRate,
        taxAmount: original.taxAmount,
        subtotal: original.subtotal,
        grandTotal: original.grandTotal,
        currency: original.currency,
        isComputerGenerated: original.isComputerGenerated,
        validity: original.validity,
        salesPerson: original.salesPerson,
        salesPhone: original.salesPhone,
        salesEmail: original.salesEmail,
        terms: original.terms,
        warranty: original.warranty,
        footer: original.footer,
        revisionNumber,
        parentId: original.id,
        items: {
          create: original.items.map((item) => ({
            description: item.description,
            details: item.details,
            quantity: item.quantity,
            unit: item.unit,
            unitPrice: item.unitPrice,
            total: item.total,
            sortOrder: item.sortOrder,
          })),
        },
      },
      include: {
        company: true,
        customer: true,
        items: true,
      },
    });

    await prisma.quotation.update({
      where: { id },
      data: { status: "REVISED" },
    });

    await createLog("REVISED", "Quotation", revision.id, session.id, `Revised quotation: ${original.quotationNumber} -> ${revisionId}`);

    return NextResponse.json(revision);
  }

  if (body.action === "duplicate") {
    const original = await prisma.quotation.findUnique({
      where: { id },
      include: { items: true, company: true },
    });

    if (!original) {
      return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
    }

    const { generateDocumentId } = await import("@/lib/id-generator");
    const newNumber = await generateDocumentId(original.company.shortCode, "Q");

    const duplicate = await prisma.quotation.create({
      data: {
        quotationNumber: newNumber,
        companyId: original.companyId,
        customerId: original.customerId,
        title: original.title ? `${original.title} (Copy)` : "Copy",
        status: "DRAFT",
        discount: original.discount,
        taxRate: original.taxRate,
        taxAmount: original.taxAmount,
        subtotal: original.subtotal,
        grandTotal: original.grandTotal,
        currency: original.currency,
        isComputerGenerated: original.isComputerGenerated,
        validity: original.validity,
        salesPerson: original.salesPerson,
        salesPhone: original.salesPhone,
        salesEmail: original.salesEmail,
        terms: original.terms,
        warranty: original.warranty,
        footer: original.footer,
        items: {
          create: original.items.map((item) => ({
            description: item.description,
            details: item.details,
            quantity: item.quantity,
            unit: item.unit,
            unitPrice: item.unitPrice,
            total: item.total,
            sortOrder: item.sortOrder,
          })),
        },
      },
      include: { company: true, customer: true, items: true },
    });

    await createLog("CREATED", "Quotation", duplicate.id, session.id, `Duplicated quotation: ${original.quotationNumber} -> ${newNumber}`);

    return NextResponse.json(duplicate);
  }

  if (body.status) {
    const quotation = await prisma.quotation.update({
      where: { id },
      data: { status: body.status },
    });

    await createLog("EDITED", "Quotation", id, session.id, `Updated quotation status to: ${body.status}`);

    return NextResponse.json(quotation);
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
