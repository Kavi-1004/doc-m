import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createLog } from "@/lib/log";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const customer = await prisma.customer.findUnique({ where: { id } });
  if (!customer) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }
  return NextResponse.json(customer);
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

  const customer = await prisma.customer.update({
    where: { id },
    data: {
      name: body.name,
      contactPerson: body.contactPerson,
      email: body.email,
      phone: body.phone,
      address: body.address,
      taxId: body.taxId,
    },
  });

  await createLog("EDITED", "Customer", id, session.id, `Updated customer: ${customer.name}`);

  return NextResponse.json(customer);
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
  const customer = await prisma.customer.findUnique({ where: { id } });

  try {
    await prisma.customer.delete({ where: { id } });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2003") {
      return NextResponse.json(
        { error: "Cannot delete customer with existing documents. Remove all related quotations, purchase orders, delivery orders, and invoices first." },
        { status: 409 }
      );
    }
    throw error;
  }

  await createLog("DELETED", "Customer", id, session.id, `Deleted customer: ${customer?.name}`);

  return NextResponse.json({ success: true });
}
