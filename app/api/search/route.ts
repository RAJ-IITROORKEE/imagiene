import type { Prisma } from "@prisma/client";
import { NextRequest } from "next/server";

import { getAssetAccessDecision } from "@/lib/asset-access";
import { getCurrentUser } from "@/lib/auth";
import { handleApiError, ok } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getRateLimitIdentifier } from "@/lib/rate-limit";
import { assetQuerySchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const limited = await checkRateLimit(getRateLimitIdentifier(request, "search"), {
      prefix: "api:search",
      limit: 60,
      window: "1 m",
    });

    if (limited) {
      return limited;
    }

    const query = assetQuerySchema.parse(
      Object.fromEntries(request.nextUrl.searchParams.entries()),
    );
    const assetWhere: Prisma.AssetWhereInput = {
      isPublished: true,
      deletedAt: null,
      OR: query.q
        ? [
            { title: { contains: query.q, mode: "insensitive" } },
            { description: { contains: query.q, mode: "insensitive" } },
          ]
        : undefined,
    };
    const textWhere = query.q
      ? { name: { contains: query.q, mode: "insensitive" as const } }
      : undefined;
    const [user, assets, categories, tags] = await Promise.all([
      getCurrentUser(),
      prisma.asset.findMany({
        where: assetWhere,
        take: Math.min(query.pageSize, 20),
        orderBy: { createdAt: "desc" },
        include: { category: true, tags: true },
      }),
      prisma.category.findMany({
        where: textWhere,
        take: 10,
        orderBy: { name: "asc" },
      }),
      prisma.tag.findMany({
        where: textWhere,
        take: 10,
        orderBy: { name: "asc" },
      }),
    ]);

    return ok({
      data: {
        assets: assets.map((asset) => ({
          ...asset,
          access: getAssetAccessDecision(user, asset),
        })),
        categories,
        tags,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
