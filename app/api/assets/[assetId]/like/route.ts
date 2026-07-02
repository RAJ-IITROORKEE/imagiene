import { NextRequest } from "next/server";

import { apiError, handleApiError, ok } from "@/lib/api-response";
import { countAssetLikes, isAssetLikedByUser, setAssetLike } from "@/lib/asset-likes";
import { requireCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assetIdParamsSchema } from "@/lib/validators";

export const runtime = "nodejs";

type LikeRouteContext = {
  params: Promise<{ assetId: string }>;
};

async function getLikeTarget(context: LikeRouteContext) {
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

export async function GET(_request: NextRequest, context: LikeRouteContext) {
  try {
    const { user, assetId } = await getLikeTarget(context);

    if (!assetId) {
      return apiError("Asset not found", 404);
    }

    const [liked, likeCount] = await Promise.all([
      isAssetLikedByUser(user.id, assetId),
      countAssetLikes(assetId),
    ]);

    return ok({ data: { liked, likeCount } });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(_request: NextRequest, context: LikeRouteContext) {
  try {
    const { user, assetId } = await getLikeTarget(context);

    if (!assetId) {
      return apiError("Asset not found", 404);
    }

    return ok({ data: await setAssetLike({ userId: user.id, assetId, liked: true }) }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: NextRequest, context: LikeRouteContext) {
  try {
    const { user, assetId } = await getLikeTarget(context);

    if (!assetId) {
      return apiError("Asset not found", 404);
    }

    return ok({ data: await setAssetLike({ userId: user.id, assetId, liked: false }) });
  } catch (error) {
    return handleApiError(error);
  }
}
