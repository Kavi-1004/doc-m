import { prisma } from "./prisma";
import { format } from "date-fns";

type DocType = "Q" | "DO" | "I";

export async function generateDocumentId(
  companyShortCode: string,
  type: DocType,
  date?: Date
): Promise<string> {
  const d = date || new Date();
  const dateStr = format(d, "yyyyMMdd");
  const prefix = `${companyShortCode}-${type}-${dateStr}`;

  let lastNumber: string | null = null;

  switch (type) {
    case "Q": {
      const records = await prisma.quotation.findMany({
        where: { quotationNumber: { startsWith: prefix } },
        orderBy: { quotationNumber: "desc" },
        take: 1,
        select: { quotationNumber: true },
      });
      lastNumber = records[0]?.quotationNumber ?? null;
      break;
    }
    case "DO": {
      const records = await prisma.deliveryOrder.findMany({
        where: { doNumber: { startsWith: prefix } },
        orderBy: { doNumber: "desc" },
        take: 1,
        select: { doNumber: true },
      });
      lastNumber = records[0]?.doNumber ?? null;
      break;
    }
    case "I": {
      const records = await prisma.invoice.findMany({
        where: { invoiceNumber: { startsWith: prefix } },
        orderBy: { invoiceNumber: "desc" },
        take: 1,
        select: { invoiceNumber: true },
      });
      lastNumber = records[0]?.invoiceNumber ?? null;
      break;
    }
  }

  let seq = 1;
  if (lastNumber) {
    const parts = lastNumber.split("-");
    const lastSeq = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastSeq)) seq = lastSeq + 1;
  }

  return `${prefix}-${String(seq).padStart(3, "0")}`;
}

export function generateRevisionId(baseId: string, revisionNumber: number): string {
  const baseParts = baseId.split("-R");
  const base = baseParts[0];
  return `${base}-R${revisionNumber}`;
}
