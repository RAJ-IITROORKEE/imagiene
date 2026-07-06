import { NextRequest } from "next/server";

import { createAdminAuditLog, requireAdmin } from "@/lib/admin";
import { resolveUniqueCategorySlug } from "@/lib/admin-taxonomy";
import { apiError, handleApiError, ok } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { categoryIdParamsSchema, updateCategorySchema } from "@/lib/validators";

export const runtime = "nodejs";

type AdminCategoryRouteContext = {
  params: Promise<{ categoryId: string }>;
};

export async function GET(_request: NextRequest, context: AdminCategoryRouteContext) {
  try {
    await requireAdmin();
    const params = categoryIdParamsSchema.parse(await context.params);
    const category = await prisma.category.findUnique({
      where: { id: params.categoryId },
      include: { _count: { select: { assets: true } } },
    });

    if (!category) {
      return apiError("Category not found", 404);
    }

    return ok({ data: category });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, context: AdminCategoryRouteContext) {
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

    const params = categoryIdParamsSchema.parse(await context.params);
    const input = updateCategorySchema.parse(await request.json());
    const category = await prisma.category.update({
      where: { id: params.categoryId },
      data: {
        ...input,
        slug: input.slug ?? (input.name ? await resolveUniqueCategorySlug(input.name, params.categoryId) : undefined),
      },
    });

    await createAdminAuditLog({
      adminId: admin.id,
      action: "category.update",
      entityType: "Category",
      entityId: category.id,
      metadata: { name: category.name, slug: category.slug },
    });

    return ok({ data: category });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, context: AdminCategoryRouteContext) {
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

    const params = categoryIdParamsSchema.parse(await context.params);
    const assetCount = await prisma.asset.count({ where: { categoryId: params.categoryId } });

    if (assetCount > 0) {
      return apiError("Category still has assets", 409);
    }

    const category = await prisma.category.delete({ where: { id: params.categoryId } });

    await createAdminAuditLog({
      adminId: admin.id,
      action: "category.delete",
      entityType: "Category",
      entityId: category.id,
      metadata: { name: category.name },
    });

    return ok({ data: category });
  } catch (error) {
    return handleApiError(error);
  }
}
