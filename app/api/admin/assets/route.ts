import type { Prisma } from "@prisma/client";
import { NextRequest } from "next/server";

import { createAdminAuditLog, requireAdmin } from "@/lib/admin";
import { syncTagAssetLinks, validateAssetRelations } from "@/lib/admin-assets";
import { apiError, handleApiError, ok } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { createSlug } from "@/lib/slug";
import { adminAssetQuerySchema, createAssetSchema } from "@/lib/validators";

export const runtime = "nodejs";

function toAssetWhere(input: ReturnType<typeof adminAssetQuerySchema.parse>): Prisma.AssetWhereInput {
  return {
    deletedAt: input.includeDeleted ? undefined : null,
    isPublished: input.isPublished,
    type: input.type,
    accessLevel: input.accessLevel,
    categoryId: input.categoryId,
    tagIds: input.tagId ? { has: input.tagId } : undefined,
    OR: input.q
      ? [
          { title: { contains: input.q, mode: "insensitive" } },
          { description: { contains: input.q, mode: "insensitive" } },
        ]
      : undefined,
  };
}

function toAssetOrderBy(sort: ReturnType<typeof adminAssetQuerySchema.parse>["sort"]): Prisma.AssetOrderByWithRelationInput {
  if (sort === "popular") {
    return { downloadCount: "desc" };
  }

  if (sort === "title") {
    return { title: "asc" };
  }

  return { createdAt: "desc" };
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const query = adminAssetQuerySchema.parse(
      Object.fromEntries(request.nextUrl.searchParams.entries()),
    );
    const where = toAssetWhere(query);
    const skip = (query.page - 1) * query.pageSize;
    const [total, assets] = await Promise.all([
      prisma.asset.count({ where }),
      prisma.asset.findMany({
        where,
        skip,
        take: query.pageSize,
        orderBy: toAssetOrderBy(query.sort),
        include: {
          category: true,
          tags: true,
          _count: { select: { bookmarks: true, downloads: true } },
        },
      }),
    ]);

    return ok({
      data: assets,
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        pageCount: Math.ceil(total / query.pageSize),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
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

    const input = createAssetSchema.parse(await request.json());
    const relationError = await validateAssetRelations({
      categoryId: input.categoryId,
      tagIds: input.tagIds,
    });

    if (relationError) {
      return apiError(relationError, 400);
    }

    const asset = await prisma.asset.create({
      data: {
        ...input,
        slug: input.slug ?? createSlug(input.title),
      },
      include: {
        category: true,
        tags: true,
      },
    });

    await syncTagAssetLinks({
      assetId: asset.id,
      previousTagIds: [],
      nextTagIds: asset.tagIds,
    });
    await createAdminAuditLog({
      adminId: admin.id,
      action: "asset.create",
      entityType: "Asset",
      entityId: asset.id,
      metadata: { title: asset.title, slug: asset.slug },
    });

    return ok({ data: asset }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
