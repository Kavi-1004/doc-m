import { prisma } from "./prisma";

export async function createLog(
  action: string,
  entity: string,
  entityId?: string,
  userId?: string,
  details?: string
) {
  await prisma.log.create({
    data: {
      action,
      entity,
      entityId,
      userId,
      details,
    },
  });
}
