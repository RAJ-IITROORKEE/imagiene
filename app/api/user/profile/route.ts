import { NextRequest } from "next/server";

import { apiError, handleApiError, ok } from "@/lib/api-response";
import { syncCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { safeProfileUpdateSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await syncCurrentUser();

    if (!user) {
      return apiError("Authentication required", 401);
    }

    const [bookmarkCount, downloadCount, activeSubscription] = await Promise.all([
      prisma.bookmark.count({ where: { userId: user.id } }),
      prisma.download.count({ where: { userId: user.id } }),
      prisma.subscription.findFirst({
        where: {
          userId: user.id,
          status: "ACTIVE",
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return ok({
      data: {
        user,
        stats: {
          bookmarks: bookmarkCount,
          downloads: downloadCount,
        },
        subscription: activeSubscription,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await syncCurrentUser();

    if (!user) {
      return apiError("Authentication required", 401);
    }

    const input = safeProfileUpdateSchema.parse(await request.json());
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: input,
    });

    return ok({ data: updatedUser });
  } catch (error) {
    return handleApiError(error);
  }
}
