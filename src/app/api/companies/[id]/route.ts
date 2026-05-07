import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createLog } from "@/lib/log";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const company = await prisma.company.findUnique({ where: { id } });
  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }
  return NextResponse.json(company);
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

  const company = await prisma.company.update({
    where: { id },
    data: {
      name: body.name,
      shortCode: body.shortCode?.toUpperCase(),
      address: body.address,
      phone: body.phone,
      email: body.email,
      website: body.website,
      logoUrl: body.logoUrl,
      taxId: body.taxId,
      taxRate: body.taxRate ? parseFloat(body.taxRate) : undefined,
      bankName: body.bankName,
      bankAccount: body.bankAccount,
      bankBranch: body.bankBranch,
      swiftCode: body.swiftCode,
    },
  });

  await createLog("EDITED", "Company", id, session.id, `Updated company: ${company.name}`);

  return NextResponse.json(company);
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
  const company = await prisma.company.findUnique({ where: { id } });

  await prisma.company.delete({ where: { id } });

  await createLog("DELETED", "Company", id, session.id, `Deleted company: ${company?.name}`);

  return NextResponse.json({ success: true });
}
