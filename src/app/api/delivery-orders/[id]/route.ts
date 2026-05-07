import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createLog } from "@/lib/log";

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
      quotation: true,
      purchaseOrder: true,
      items: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!deliveryOrder) {
    return NextResponse.json({ error: "Delivery order not found" }, { status: 404 });
  }

  return NextResponse.json(deliveryOrder);
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

  await prisma.deliveryOrderItem.deleteMany({ where: { deliveryOrderId: id } });

  const parsedItems = (body.items || []).map((item: { description: string; quantity: number; unit: string; sortOrder: number }) => ({
    description: item.description,
    quantity: item.quantity || 1,
    unit: item.unit || "pcs",
    sortOrder: item.sortOrder || 0,
  }));

  const deliveryOrder = await prisma.deliveryOrder.update({
    where: { id },
    data: {
      status: body.status,
      deliveryDate: body.deliveryDate ? new Date(body.deliveryDate) : undefined,
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

  await createLog("EDITED", "DeliveryOrder", id, session.id, `Updated DO: ${deliveryOrder.doNumber}`);

  return NextResponse.json(deliveryOrder);
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

  try {
    await prisma.deliveryOrder.delete({ where: { id } });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2003") {
      return NextResponse.json(
        { error: "Cannot delete delivery order with existing invoices. Remove them first." },
        { status: 409 }
      );
    }
    throw error;
  }

  await createLog("DELETED", "DeliveryOrder", id, session.id, "Deleted delivery order");

  return NextResponse.json({ success: true });
}
