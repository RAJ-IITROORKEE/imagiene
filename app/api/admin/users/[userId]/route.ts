import { NextRequest } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";

import { createAdminAuditLog, requireAdmin } from "@/lib/admin";
import { apiError, handleApiError, ok } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { adminUpdateUserSchema, userIdParamsSchema } from "@/lib/validators";

export const runtime = "nodejs";

type AdminUserRouteContext = {
  params: Promise<{ userId: string }>;
};

export async function GET(_request: NextRequest, context: AdminUserRouteContext) {
  try {
    await requireAdmin();
    const params = userIdParamsSchema.parse(await context.params);
    const user = await prisma.user.findUnique({
      where: { id: params.userId },
      include: {
        subscriptions: { orderBy: { createdAt: "desc" }, take: 10 },
        payments: { orderBy: { createdAt: "desc" }, take: 10 },
        _count: { select: { bookmarks: true, downloads: true } },
      },
    });

    if (!user) {
      return apiError("User not found", 404);
    }

    return ok({ data: user });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, context: AdminUserRouteContext) {
  try {
    const admin = await requireAdmin();
    const limited = await checkRateLimit(`admin:${admin.id}`, {
      prefix: "api:admin-mutations",
      limit: 60,
      window: "1 m",
    });

    if (limited) {
      return limited;
    }

    const params = userIdParamsSchema.parse(await context.params);
    const input = adminUpdateUserSchema.parse(await request.json());

    if (params.userId === admin.id && (input.role === "USER" || input.isActive === false)) {
      return apiError("You cannot remove your own admin access", 400);
    }

    const user = await prisma.user.update({
      where: { id: params.userId },
      data: input,
    });

    await createAdminAuditLog({
      adminId: admin.id,
      action: "user.update",
      entityType: "User",
      entityId: user.id,
      metadata: {
        email: user.email,
        role: user.role,
        plan: user.plan,
        isActive: user.isActive,
      },
    });

    return ok({ data: user });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, context: AdminUserRouteContext) {
  try {
    const admin = await requireAdmin();
    const limited = await checkRateLimit(`admin:${admin.id}`, {
      prefix: "api:admin-mutations",
      limit: 60,
      window: "1 m",
    });

    if (limited) {
      return limited;
    }

    const params = userIdParamsSchema.parse(await context.params);

    if (params.userId === admin.id) {
      return apiError("You cannot remove your own admin account", 400);
    }

    const user = await prisma.user.findUnique({ where: { id: params.userId } });

    if (!user) {
      return apiError("User not found", 404);
    }

    const clerk = await clerkClient();
    await clerk.users.deleteUser(user.clerkId);

    await prisma.$transaction(async (tx) => {
      await tx.bookmark.deleteMany({ where: { userId: user.id } });
      await tx.download.deleteMany({ where: { userId: user.id } });
      await tx.subscription.deleteMany({ where: { userId: user.id } });
      await tx.payment.deleteMany({ where: { userId: user.id } });
      await tx.adminAuditLog.deleteMany({ where: { adminId: user.id } });
      await tx.user.delete({ where: { id: user.id } });
      await tx.adminAuditLog.create({
        data: {
          adminId: admin.id,
          action: "user.delete",
          entityType: "User",
          entityId: user.id,
          metadata: {
            email: user.email,
            role: user.role,
            plan: user.plan,
          },
        },
      });
    });

    return ok({ data: { id: user.id } });
  } catch (error) {
    return handleApiError(error);
  }
}
