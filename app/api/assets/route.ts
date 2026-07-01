import type { Prisma } from "@/lib/generated/prisma";
import { NextRequest } from "next/server";

import { apiError, handleApiError, ok } from "@/lib/api-response";
import { withProtectedAssetPreviewUrl } from "@/lib/asset-preview";
import { getCurrentUser } from "@/lib/auth";
import { getAssetAccessDecision } from "@/lib/asset-access";
import { prisma } from "@/lib/prisma";
import { assetQuerySchema } from "@/lib/validators";

export const runtime = "nodejs";

function toAssetWhere(input: ReturnType<typeof assetQuerySchema.parse>): Prisma.AssetWhereInput {
  return {
    isPublished: true,
    deletedAt: null,
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

function toAssetOrderBy(sort: ReturnType<typeof assetQuerySchema.parse>["sort"]): Prisma.AssetOrderByWithRelationInput {
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
    const query = assetQuerySchema.parse(
      Object.fromEntries(request.nextUrl.searchParams.entries()),
    );
    const where = toAssetWhere(query);
    const skip = (query.page - 1) * query.pageSize;
    const [user, total, assets] = await Promise.all([
      getCurrentUser(),
      prisma.asset.count({ where }),
      prisma.asset.findMany({
        where,
        skip,
        take: query.pageSize,
        orderBy: toAssetOrderBy(query.sort),
        include: {
          category: true,
          tags: true,
        },
      }),
    ]);

    return ok({
      data: assets.map((asset) => ({
        ...withProtectedAssetPreviewUrl(asset),
        access: getAssetAccessDecision(user, asset),
      })),
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

export async function POST() {
  return apiError("Asset creation is available through admin APIs only", 405);
}
