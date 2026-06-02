import { NextRequest } from "next/server";

import { handleApiError, ok } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { categoryQuerySchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const query = categoryQuerySchema.parse(
      Object.fromEntries(request.nextUrl.searchParams.entries()),
    );
    const where = query.q
      ? {
          name: { contains: query.q, mode: "insensitive" as const },
        }
      : undefined;
    const skip = (query.page - 1) * query.pageSize;
    const [total, tags] = await Promise.all([
      prisma.tag.count({ where }),
      prisma.tag.findMany({
        where,
        skip,
        take: query.pageSize,
        orderBy: { name: "asc" },
        include: {
          _count: {
            select: { assets: true },
          },
        },
      }),
    ]);

    return ok({
      data: tags,
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
