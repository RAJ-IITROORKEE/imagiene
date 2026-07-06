import { NextRequest } from "next/server";

import { createAdminAuditLog, requireAdmin } from "@/lib/admin";
import { resolveUniqueAssetSlug, syncTagAssetLinks, validateAssetRelations, validateAssetTitle } from "@/lib/admin-assets";
import { apiError, handleApiError, ok } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { deleteR2Object } from "@/lib/r2";
import { assetIdParamsSchema, updateAssetSchema } from "@/lib/validators";

export const runtime = "nodejs";

type AdminAssetRouteContext = {
  params: Promise<{ assetId: string }>;
};

export async function GET(_request: NextRequest, context: AdminAssetRouteContext) {
  try {
    await requireAdmin();
    const params = assetIdParamsSchema.parse(await context.params);
    const asset = await prisma.asset.findUnique({
      where: { id: params.assetId },
      include: {
        category: true,
        tags: true,
        bookmarks: { take: 10, orderBy: { createdAt: "desc" } },
        downloads: { take: 10, orderBy: { createdAt: "desc" } },
      },
    });

    if (!asset) {
      return apiError("Asset not found", 404);
    }

    return ok({ data: asset });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, context: AdminAssetRouteContext) {
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

    const params = assetIdParamsSchema.parse(await context.params);
    const input = updateAssetSchema.parse(await request.json());
    const existing = await prisma.asset.findUnique({ where: { id: params.assetId } });

    if (!existing) {
      return apiError("Asset not found", 404);
    }

    if (input.title) {
      const uniquenessError = await validateAssetTitle(input.title, params.assetId);

      if (uniquenessError) {
        return apiError(uniquenessError, 409);
      }
    }

    const relationError = await validateAssetRelations({
      categoryId: input.categoryId,
      tagIds: input.tagIds,
    });

    if (relationError) {
      return apiError(relationError, 400);
    }

    const asset = await prisma.asset.update({
      where: { id: params.assetId },
      data: {
        ...input,
        slug: input.title ? await resolveUniqueAssetSlug(input.title, params.assetId) : input.slug,
      },
      include: {
        category: true,
        tags: true,
      },
    });

    if (input.tagIds) {
      await syncTagAssetLinks({
        assetId: asset.id,
        previousTagIds: existing.tagIds,
        nextTagIds: asset.tagIds,
      });
    }

    await createAdminAuditLog({
      adminId: admin.id,
      action: "asset.update",
      entityType: "Asset",
      entityId: asset.id,
      metadata: { title: asset.title, isPublished: asset.isPublished },
    });

    return ok({ data: asset });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, context: AdminAssetRouteContext) {
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

    const params = assetIdParamsSchema.parse(await context.params);
    const existing = await prisma.asset.findUnique({ where: { id: params.assetId } });

    if (!existing) {
      return apiError("Asset not found", 404);
    }

    await Promise.all([
      deleteR2Object({ key: existing.fileUrl, purpose: "asset" }),
      deleteR2Object({ key: existing.previewUrl, purpose: "preview" }),
    ]);

    const asset = await prisma.asset.update({
      where: { id: params.assetId },
      data: {
        deletedAt: new Date(),
        isPublished: false,
      },
    });

    await createAdminAuditLog({
      adminId: admin.id,
      action: "asset.soft_delete",
      entityType: "Asset",
      entityId: asset.id,
      metadata: { title: asset.title, r2ObjectsDeleted: true },
    });

    return ok({ data: asset });
  } catch (error) {
    return handleApiError(error);
  }
}
