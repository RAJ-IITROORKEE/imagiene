import type { Prisma, User } from "@prisma/client";

import { requireCurrentUser } from "@/lib/auth";
import { isAdmin } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export class ForbiddenError extends Error {
  constructor(message = "Admin access required") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export async function requireAdmin(): Promise<User> {
  const user = await requireCurrentUser();

  if (!user.isActive || !isAdmin(user)) {
    throw new ForbiddenError();
  }

  return user;
}

export async function createAdminAuditLog({
  adminId,
  action,
  entityType,
  entityId,
  metadata,
}: {
  adminId: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Prisma.InputJsonValue;
}) {
  return prisma.adminAuditLog.create({
    data: {
      adminId,
      action,
      entityType,
      entityId,
      metadata,
    },
  });
}
