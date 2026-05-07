import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminRole = await prisma.role.upsert({
    where: { name: "admin" },
    update: {},
    create: {
      name: "admin",
      permissions: [
        "companies:read", "companies:write",
        "customers:read", "customers:write",
        "quotations:read", "quotations:write",
        "purchase-orders:read", "purchase-orders:write",
        "delivery-orders:read", "delivery-orders:write",
        "invoices:read", "invoices:write",
        "settings:read", "settings:write",
        "logs:read",
        "users:read", "users:write",
      ],
    },
  });

  await prisma.role.upsert({
    where: { name: "user" },
    update: {},
    create: {
      name: "user",
      permissions: [
        "companies:read",
        "customers:read", "customers:write",
        "quotations:read", "quotations:write",
        "purchase-orders:read", "purchase-orders:write",
        "delivery-orders:read", "delivery-orders:write",
        "invoices:read", "invoices:write",
      ],
    },
  });

  const passwordHash = await bcrypt.hash("admin123", 12);
  await prisma.user.upsert({
    where: { email: "admin@docmanager.com" },
    update: {},
    create: {
      email: "admin@docmanager.com",
      name: "Admin User",
      passwordHash,
      roleId: adminRole.id,
    },
  });

  const features = [
    { key: "quotation_enabled", value: "true" },
    { key: "po_enabled", value: "true" },
    { key: "do_enabled", value: "true" },
    { key: "invoice_enabled", value: "true" },
    { key: "default_tax_rate", value: "0" },
    { key: "company_name", value: "DocManager" },
  ];

  for (const f of features) {
    await prisma.featureSetting.upsert({
      where: { key: f.key },
      update: { value: f.value },
      create: f,
    });
  }

  console.log("Seed completed successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
