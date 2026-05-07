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

  let maxSeq = 0;

  const extractSeq = (numbers: string[]) => {
    for (const num of numbers) {
      const base = num.split("-R")[0];
      const parts = base.split("-");
      const seqStr = parts[parts.length - 1];
      const seq = parseInt(seqStr, 10);
      if (!isNaN(seq) && seq > maxSeq) maxSeq = seq;
    }
  };

  switch (type) {
    case "Q": {
      const all = await prisma.quotation.findMany({
        where: { quotationNumber: { startsWith: prefix } },
        select: { quotationNumber: true },
      });
      extractSeq(all.map((r) => r.quotationNumber));
      break;
    }
    case "DO": {
      const all = await prisma.deliveryOrder.findMany({
        where: { doNumber: { startsWith: prefix } },
        select: { doNumber: true },
      });
      extractSeq(all.map((r) => r.doNumber));
      const altPrefix = `${companyShortCode}-D-${dateStr}`;
      const altAll = await prisma.deliveryOrder.findMany({
        where: { doNumber: { startsWith: altPrefix } },
        select: { doNumber: true },
      });
      extractSeq(altAll.map((r) => r.doNumber));
      break;
    }
    case "I": {
      const all = await prisma.invoice.findMany({
        where: { invoiceNumber: { startsWith: prefix } },
        select: { invoiceNumber: true },
      });
      extractSeq(all.map((r) => r.invoiceNumber));
      break;
    }
  }

  return `${prefix}-${String(maxSeq + 1).padStart(3, "0")}`;
}

export function generateRevisionId(baseId: string, revisionNumber: number): string {
  const baseParts = baseId.split("-R");
  const base = baseParts[0];
  return `${base}-R${revisionNumber}`;
}
