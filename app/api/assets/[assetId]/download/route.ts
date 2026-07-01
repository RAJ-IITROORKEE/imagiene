import { NextRequest } from "next/server";

import { apiError, handleApiError, ok } from "@/lib/api-response";
import { getAssetAccessDecision, getAssetAccessMessage } from "@/lib/asset-access";
import { requireCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getR2DownloadUrl, isExternalUrl } from "@/lib/r2";
import { checkRateLimit } from "@/lib/rate-limit";
import { assetIdParamsSchema } from "@/lib/validators";

export const runtime = "nodejs";

type DownloadRouteContext = {
  params: Promise<{ assetId: string }>;
};

export async function POST(_request: NextRequest, context: DownloadRouteContext) {
  try {
    const params = assetIdParamsSchema.parse(await context.params);
    const user = await requireCurrentUser();
    const limited = await checkRateLimit(`download:${user.id}`, {
      prefix: "api:downloads",
      limit: 30,
      window: "1 m",
    });

    if (limited) {
      return limited;
    }

    const asset = await prisma.asset.findFirst({
      where: {
        id: params.assetId,
        isPublished: true,
        deletedAt: null,
      },
    });

    if (!asset) {
      return apiError("Asset not found", 404);
    }

    const access = getAssetAccessDecision(user, asset);

    if (!access.allowed) {
      return apiError(getAssetAccessMessage(access) ?? "Asset access denied", 403, access);
    }

    const [download] = await Promise.all([
      prisma.download.create({
        data: {
          userId: user.id,
          assetId: asset.id,
        },
      }),
      prisma.asset.update({
        where: { id: asset.id },
        data: { downloadCount: { increment: 1 } },
      }),
    ]);

    const fileUrl = isExternalUrl(asset.fileUrl) ? asset.fileUrl : getR2DownloadUrl(asset.fileUrl);

    return ok({
      data: {
        downloadId: download.id,
        fileUrl,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
