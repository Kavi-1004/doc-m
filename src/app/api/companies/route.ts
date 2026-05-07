import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createLog } from "@/lib/log";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";

  const companies = await prisma.company.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { shortCode: { contains: search, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(companies);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, shortCode, address, phone, email, website, logoUrl, taxId, taxRate, bankName, bankAccount, bankBranch, swiftCode } = body;

  if (!name || !shortCode) {
    return NextResponse.json(
      { error: "Name and short code are required" },
      { status: 400 }
    );
  }

  const company = await prisma.company.create({
    data: {
      name,
      shortCode: shortCode.toUpperCase(),
      address,
      phone,
      email,
      website,
      logoUrl,
      taxId,
      taxRate: taxRate ? parseFloat(taxRate) : 0,
      bankName,
      bankAccount,
      bankBranch,
      swiftCode,
    },
  });

  await createLog("CREATED", "Company", company.id, session.id, `Created company: ${name}`);

  return NextResponse.json(company, { status: 201 });
}
