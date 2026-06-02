import { NextRequest } from "next/server";

import { createAdminAuditLog, requireAdmin } from "@/lib/admin";
import { apiError, handleApiError, ok } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { tagIdParamsSchema, updateTagSchema } from "@/lib/validators";

export const runtime = "nodejs";

type AdminTagRouteContext = {
  params: Promise<{ tagId: string }>;
};

export async function GET(_request: NextRequest, context: AdminTagRouteContext) {
  try {
    await requireAdmin();
    const params = tagIdParamsSchema.parse(await context.params);
    const tag = await prisma.tag.findUnique({
      where: { id: params.tagId },
      include: { _count: { select: { assets: true } } },
    });

    if (!tag) {
      return apiError("Tag not found", 404);
    }

    return ok({ data: tag });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, context: AdminTagRouteContext) {
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

    const params = tagIdParamsSchema.parse(await context.params);
    const input = updateTagSchema.parse(await request.json());
    const tag = await prisma.tag.update({
      where: { id: params.tagId },
      data: input,
    });

    await createAdminAuditLog({
      adminId: admin.id,
      action: "tag.update",
      entityType: "Tag",
      entityId: tag.id,
      metadata: { name: tag.name, slug: tag.slug },
    });

    return ok({ data: tag });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, context: AdminTagRouteContext) {
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

    const params = tagIdParamsSchema.parse(await context.params);
    const assetCount = await prisma.asset.count({ where: { tagIds: { has: params.tagId } } });

    if (assetCount > 0) {
      return apiError("Tag still has assets", 409);
    }

    const tag = await prisma.tag.delete({ where: { id: params.tagId } });

    await createAdminAuditLog({
      adminId: admin.id,
      action: "tag.delete",
      entityType: "Tag",
      entityId: tag.id,
      metadata: { name: tag.name },
    });

    return ok({ data: tag });
  } catch (error) {
    return handleApiError(error);
  }
}
