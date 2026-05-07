import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createLog } from "@/lib/log";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const po = await prisma.purchaseOrder.findUnique({
    where: { id },
    include: { quotation: true, customer: true },
  });
  if (!po) {
    return NextResponse.json({ error: "Purchase order not found" }, { status: 404 });
  }
  return NextResponse.json(po);
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

  const po = await prisma.purchaseOrder.update({
    where: { id },
    data: {
      poNumber: body.poNumber,
      status: body.status,
      notes: body.notes,
      fileUrl: body.fileUrl,
      fileName: body.fileName,
    },
  });

  await createLog("EDITED", "PurchaseOrder", id, session.id, `Updated PO: ${po.poNumber}`);

  return NextResponse.json(po);
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
  await prisma.purchaseOrder.delete({ where: { id } });
  await createLog("DELETED", "PurchaseOrder", id, session.id, "Deleted purchase order");

  return NextResponse.json({ success: true });
}
