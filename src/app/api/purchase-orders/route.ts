import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createLog } from "@/lib/log";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { poNumber: { contains: search, mode: "insensitive" } },
      { quotation: { quotationNumber: { contains: search, mode: "insensitive" } } },
      { customer: { name: { contains: search, mode: "insensitive" } } },
    ];
  }

  const purchaseOrders = await prisma.purchaseOrder.findMany({
    where,
    include: {
      quotation: { select: { quotationNumber: true, title: true } },
      customer: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(purchaseOrders);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { poNumber, quotationId, customerId, fileUrl, fileName, notes } = body;

  if (!quotationId || !customerId) {
    return NextResponse.json(
      { error: "Quotation and customer are required" },
      { status: 400 }
    );
  }

  const po = await prisma.purchaseOrder.create({
    data: {
      poNumber,
      quotationId,
      customerId,
      fileUrl,
      fileName,
      notes,
    },
    include: {
      quotation: true,
      customer: true,
    },
  });

  await prisma.quotation.update({
    where: { id: quotationId },
    data: { status: "APPROVED" },
  });

  await createLog("CREATED", "PurchaseOrder", po.id, session.id, `Uploaded PO: ${poNumber || "N/A"}`);

  return NextResponse.json(po, { status: 201 });
}
