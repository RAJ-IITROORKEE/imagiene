import { NextRequest } from "next/server";

import { apiError, handleApiError, ok } from "@/lib/api-response";
import { requireCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assetIdParamsSchema } from "@/lib/validators";

export const runtime = "nodejs";

type BookmarkRouteContext = {
  params: Promise<{ assetId: string }>;
};

async function getBookmarkTarget(context: BookmarkRouteContext) {
  const params = assetIdParamsSchema.parse(await context.params);
  const user = await requireCurrentUser();
  const asset = await prisma.asset.findFirst({
    where: {
      id: params.assetId,
      isPublished: true,
      deletedAt: null,
    },
    select: { id: true },
  });

  if (!asset) {
    return { user, assetId: null };
  }

  return { user, assetId: asset.id };
}

export async function GET(_request: NextRequest, context: BookmarkRouteContext) {
  try {
    const { user, assetId } = await getBookmarkTarget(context);

    if (!assetId) {
      return apiError("Asset not found", 404);
    }

    const bookmark = await prisma.bookmark.findUnique({
      where: {
        userId_assetId: {
          userId: user.id,
          assetId,
        },
      },
    });

    return ok({ data: { bookmarked: Boolean(bookmark), bookmark } });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(_request: NextRequest, context: BookmarkRouteContext) {
  try {
    const { user, assetId } = await getBookmarkTarget(context);

    if (!assetId) {
      return apiError("Asset not found", 404);
    }

    const bookmark = await prisma.bookmark.upsert({
      where: {
        userId_assetId: {
          userId: user.id,
          assetId,
        },
      },
      create: {
        userId: user.id,
        assetId,
      },
      update: {},
    });

    return ok({ data: { bookmarked: true, bookmark } }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, context: BookmarkRouteContext) {
  try {
    const { user, assetId } = await getBookmarkTarget(context);

    if (!assetId) {
      return apiError("Asset not found", 404);
    }

    await prisma.bookmark.deleteMany({
      where: {
        userId: user.id,
        assetId,
      },
    });

    return ok({ data: { bookmarked: false } });
  } catch (error) {
    return handleApiError(error);
  }
}
