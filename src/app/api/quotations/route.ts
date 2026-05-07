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
      { quotationNumber: { contains: search, mode: "insensitive" } },
      { title: { contains: search, mode: "insensitive" } },
      { customer: { name: { contains: search, mode: "insensitive" } } },
    ];
  }

  if (status) {
    where.status = status;
  }

  const quotations = await prisma.quotation.findMany({
    where,
    include: {
      company: { select: { name: true, shortCode: true } },
      customer: { select: { name: true } },
      items: { orderBy: { sortOrder: "asc" } },
      _count: { select: { items: true, purchaseOrders: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(quotations);
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { companyId, customerId, title, items, discount, taxRate, terms, warranty, footer, status } = body;

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

    const quotationNumber = await generateDocumentId(company.shortCode, "Q");

    const parsedItems = (items || []).map((item: { description: string; details?: string; quantity: number; unit: string; unitPrice: number; sortOrder: number }) => ({
      description: item.description,
      details: item.details || "",
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

    const quotation = await prisma.quotation.create({
      data: {
        quotationNumber,
        companyId,
        customerId,
        title,
        status: status || "DRAFT",
        discount: discountAmount,
        taxRate: tax,
        taxAmount,
        subtotal,
        grandTotal,
        currency: body.currency || "LKR",
        isComputerGenerated: body.isComputerGenerated || false,
        validity: body.validity || "30 DAYS",
        salesPerson: body.salesPerson || "-",
        salesPhone: body.salesPhone || "-",
        salesEmail: body.salesEmail || "-",
        terms,
        warranty,
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

    await createLog("CREATED", "Quotation", quotation.id, session.id, `Created quotation: ${quotationNumber}`);

    return NextResponse.json(quotation, { status: 201 });
  } catch (error) {
    console.error("Quotation Creation Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create quotation" },
      { status: 500 }
    );
  }
}
