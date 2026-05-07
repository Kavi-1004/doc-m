import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, hashPassword } from "@/lib/auth";
import { createLog } from "@/lib/log";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!session.permissions.includes("users:read")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";

  const users = await prisma.user.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }
      : undefined,
    include: { role: true },
    orderBy: { createdAt: "desc" },
  });

  const sanitized = users.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    isActive: u.isActive,
    roleId: u.roleId,
    roleName: u.role.name,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  }));

  return NextResponse.json(sanitized);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!session.permissions.includes("users:write")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { name, email, password, roleId, isActive } = body;

  if (!name || !email || !password || !roleId) {
    return NextResponse.json(
      { error: "Name, email, password, and role are required" },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "A user with this email already exists" },
      { status: 409 }
    );
  }

  const role = await prisma.role.findUnique({ where: { id: roleId } });
  if (!role) {
    return NextResponse.json(
      { error: "Invalid role" },
      { status: 400 }
    );
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      roleId,
      isActive: isActive !== false,
    },
    include: { role: true },
  });

  await createLog("CREATED", "User", user.id, session.id, `Created user: ${name} (${email})`);

  return NextResponse.json(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      isActive: user.isActive,
      roleId: user.roleId,
      roleName: user.role.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    { status: 201 }
  );
}
