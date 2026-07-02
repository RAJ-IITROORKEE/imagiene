import { clerkClient } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

import { apiError, handleApiError, ok } from "@/lib/api-response";
import { syncCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { safeProfileUpdateSchema } from "@/lib/validators";

export const runtime = "nodejs";

const MAX_PROFILE_IMAGE_SIZE = 5 * 1024 * 1024;

function splitDisplayName(name: string) {
  const [firstName, ...lastName] = name.trim().split(/\s+/);

  return {
    firstName,
    lastName: lastName.join(" "),
  };
}

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

    const formData = await request.formData();
    const input = safeProfileUpdateSchema.parse({
      name: formData.get("name"),
    });
    const image = formData.get("profileImage");
    const hasImageUpload = image instanceof File && image.size > 0;

    if (hasImageUpload) {
      if (!image.type.startsWith("image/")) {
        return apiError("Profile image must be an image file", 400);
      }

      if (image.size > MAX_PROFILE_IMAGE_SIZE) {
        return apiError("Profile image must be 5MB or smaller", 400);
      }
    }

    const clerk = await clerkClient();
    let clerkUser = null;

    if (input.name) {
      clerkUser = await clerk.users.updateUser(user.clerkId, splitDisplayName(input.name));
    }

    if (hasImageUpload) {
      clerkUser = await clerk.users.updateUserProfileImage(user.clerkId, { file: image });
    }

    const updateData = {
      ...(input.name ? { name: input.name } : {}),
      ...(clerkUser?.imageUrl ? { imageUrl: clerkUser.imageUrl } : {}),
    };

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    return ok({ data: updatedUser });
  } catch (error) {
    return handleApiError(error);
  }
}
