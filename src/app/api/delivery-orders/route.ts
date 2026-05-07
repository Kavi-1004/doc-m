import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createLog } from "@/lib/log";
import { generateDocumentId } from "@/lib/id-generator";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { doNumber: { contains: search, mode: "insensitive" } },
      { customer: { name: { contains: search, mode: "insensitive" } } },
    ];
  }

  const deliveryOrders = await prisma.deliveryOrder.findMany({
    where,
    include: {
      company: { select: { name: true, shortCode: true } },
      customer: { select: { name: true } },
      quotation: { select: { quotationNumber: true } },
      items: { orderBy: { sortOrder: "asc" } },
      _count: { select: { items: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(deliveryOrders);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { companyId, customerId, quotationId, purchaseOrderId, deliveryDate, items, footer, doNumber: clientDoNumber, status } = body;

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

  let doNumber = clientDoNumber;
  if (!doNumber) {
    if (quotationId) {
      const quotation = await prisma.quotation.findUnique({ where: { id: quotationId } });
      if (quotation?.quotationNumber) {
        doNumber = quotation.quotationNumber.replace("-Q-", "-D-");
      }
    }
    if (!doNumber) {
      doNumber = await generateDocumentId(company.shortCode, "DO");
    }
  }

  const parsedItems = (items || []).map((item: { description: string; quantity: number; unit: string; sortOrder: number }) => ({
    description: item.description,
    quantity: item.quantity || 1,
    unit: item.unit || "pcs",
    sortOrder: item.sortOrder || 0,
  }));

  const deliveryOrder = await prisma.deliveryOrder.create({
    data: {
      doNumber,
      companyId,
      customerId,
      quotationId,
      purchaseOrderId,
      status: status || "PENDING",
      deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
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

  await createLog("CREATED", "DeliveryOrder", deliveryOrder.id, session.id, `Created DO: ${doNumber}`);

  return NextResponse.json(deliveryOrder, { status: 201 });
}
