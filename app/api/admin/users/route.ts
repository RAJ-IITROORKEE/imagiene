import type { Prisma } from "@prisma/client";
import { NextRequest } from "next/server";

import { requireAdmin } from "@/lib/admin";
import { handleApiError, ok } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { userQuerySchema } from "@/lib/validators";

export const runtime = "nodejs";

function toUserWhere(input: ReturnType<typeof userQuerySchema.parse>): Prisma.UserWhereInput {
  return {
    role: input.role,
    plan: input.plan,
    OR: input.q
      ? [
          { email: { contains: input.q, mode: "insensitive" } },
          { name: { contains: input.q, mode: "insensitive" } },
        ]
      : undefined,
  };
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const query = userQuerySchema.parse(
      Object.fromEntries(request.nextUrl.searchParams.entries()),
    );
    const where = toUserWhere(query);
    const skip = (query.page - 1) * query.pageSize;
    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: query.pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { bookmarks: true, downloads: true, payments: true } },
        },
      }),
    ]);

    return ok({
      data: users,
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
