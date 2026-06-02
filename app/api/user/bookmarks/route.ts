import { NextRequest } from "next/server";

import { handleApiError, ok, apiError } from "@/lib/api-response";
import { getAssetAccessDecision } from "@/lib/asset-access";
import { syncCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { paginationSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const user = await syncCurrentUser();

    if (!user) {
      return apiError("Authentication required", 401);
    }

    const query = paginationSchema.parse(
      Object.fromEntries(request.nextUrl.searchParams.entries()),
    );
    const where = { userId: user.id };
    const skip = (query.page - 1) * query.pageSize;
    const [total, bookmarks] = await Promise.all([
      prisma.bookmark.count({ where }),
      prisma.bookmark.findMany({
        where,
        skip,
        take: query.pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          asset: {
            include: {
              category: true,
              tags: true,
            },
          },
        },
      }),
    ]);

    return ok({
      data: bookmarks.map((bookmark) => ({
        ...bookmark,
        asset: {
          ...bookmark.asset,
          access: getAssetAccessDecision(user, bookmark.asset),
        },
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
