import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { createLog } from "@/lib/log";

export async function GET() {
  const settings = await prisma.featureSetting.findMany({
    orderBy: { key: "asc" },
  });
  return NextResponse.json(settings);
}

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { settings } = body;

  if (!Array.isArray(settings)) {
    return NextResponse.json({ error: "Invalid settings format" }, { status: 400 });
  }

  for (const s of settings) {
    await prisma.featureSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: { key: s.key, value: s.value },
    });
  }

  await createLog("EDITED", "Settings", undefined, session.id, "Updated feature settings");

  return NextResponse.json({ success: true });
}
