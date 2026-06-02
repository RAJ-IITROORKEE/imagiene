import { NextRequest } from "next/server";

import { apiError, handleApiError, ok } from "@/lib/api-response";
import { getAssetAccessDecision, getAssetAccessMessage } from "@/lib/asset-access";
import { getCurrentUser } from "@/lib/auth";
import { isAdmin } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { assetIdParamsSchema } from "@/lib/validators";

export const runtime = "nodejs";

type AssetRouteContext = {
  params: Promise<{ assetId: string }>;
};

export async function GET(_request: NextRequest, context: AssetRouteContext) {
  try {
    const params = assetIdParamsSchema.parse(await context.params);
    const user = await getCurrentUser();
    const asset = await prisma.asset.findFirst({
      where: {
        id: params.assetId,
        deletedAt: null,
        OR: isAdmin(user) ? undefined : [{ isPublished: true }],
      },
      include: {
        category: true,
        tags: true,
      },
    });

    if (!asset) {
      return apiError("Asset not found", 404);
    }

    const access = getAssetAccessDecision(user, asset);

    return ok({
      data: {
        ...asset,
        access,
        accessMessage: getAssetAccessMessage(access),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
