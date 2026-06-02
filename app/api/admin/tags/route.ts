import { NextRequest } from "next/server";

import { createAdminAuditLog, requireAdmin } from "@/lib/admin";
import { handleApiError, ok } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { createSlug } from "@/lib/slug";
import { categoryQuerySchema, createTagSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const query = categoryQuerySchema.parse(
      Object.fromEntries(request.nextUrl.searchParams.entries()),
    );
    const where = query.q
      ? { name: { contains: query.q, mode: "insensitive" as const } }
      : undefined;
    const skip = (query.page - 1) * query.pageSize;
    const [total, tags] = await Promise.all([
      prisma.tag.count({ where }),
      prisma.tag.findMany({
        where,
        skip,
        take: query.pageSize,
        orderBy: { name: "asc" },
        include: { _count: { select: { assets: true } } },
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

    const input = createTagSchema.parse(await request.json());
    const tag = await prisma.tag.create({
      data: {
        ...input,
        slug: input.slug ?? createSlug(input.name),
        assetIds: [],
      },
    });

    await createAdminAuditLog({
      adminId: admin.id,
      action: "tag.create",
      entityType: "Tag",
      entityId: tag.id,
      metadata: { name: tag.name, slug: tag.slug },
    });

    return ok({ data: tag }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
