import type { Prisma } from "@/lib/generated/prisma";
import { NextRequest } from "next/server";

import { requireAdmin } from "@/lib/admin";
import { handleApiError, ok } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { subscriptionQuerySchema } from "@/lib/validators";

export const runtime = "nodejs";

async function getMatchingUserIds(q: string | undefined): Promise<string[] | undefined> {
  if (!q) {
    return undefined;
  }

  const users = await prisma.user.findMany({
    where: {
      OR: [
        { email: { contains: q, mode: "insensitive" } },
        { name: { contains: q, mode: "insensitive" } },
      ],
    },
    select: { id: true },
  });

  return users.map((user) => user.id);
}

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const query = subscriptionQuerySchema.parse(
      Object.fromEntries(request.nextUrl.searchParams.entries()),
    );
    const userIds = await getMatchingUserIds(query.q);
    const where: Prisma.SubscriptionWhereInput = {
      plan: query.plan,
      status: query.status,
      userId: userIds ? { in: userIds } : undefined,
    };
    const skip = (query.page - 1) * query.pageSize;
    const [total, subscriptions] = await Promise.all([
      prisma.subscription.count({ where }),
      prisma.subscription.findMany({
        where,
        skip,
        take: query.pageSize,
        orderBy: { createdAt: "desc" },
        include: { user: true },
      }),
    ]);

    return ok({
      data: subscriptions,
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
