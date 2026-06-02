import type { DeletedObjectJSON, UserJSON, WebhookEvent } from "@clerk/nextjs/server";
import { Webhook } from "svix";

import { apiError, handleApiError, ok } from "@/lib/api-response";
import { getDefaultRoleForEmail } from "@/lib/default-admin";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function getPrimaryEmail(user: UserJSON): string | null {
  const primaryEmail = user.email_addresses.find(
    (email) => email.id === user.primary_email_address_id,
  );

  return primaryEmail?.email_address ?? user.email_addresses[0]?.email_address ?? null;
}

function getDisplayName(user: UserJSON): string | null {
  return [user.first_name, user.last_name].filter(Boolean).join(" ") || null;
}

async function upsertClerkUser(user: UserJSON) {
  const email = getPrimaryEmail(user);

  if (!email) {
    return null;
  }

  const role = getDefaultRoleForEmail(email);

  return prisma.user.upsert({
    where: { clerkId: user.id },
    create: {
      clerkId: user.id,
      email,
      name: getDisplayName(user),
      imageUrl: user.image_url,
      isActive: true,
      role,
    },
    update: {
      email,
      name: getDisplayName(user),
      imageUrl: user.image_url,
      isActive: true,
      role: role === "ADMIN" ? role : undefined,
    },
  });
}

async function deactivateClerkUser(user: DeletedObjectJSON) {
  if (!user.id) {
    return { count: 0 };
  }

  return prisma.user.updateMany({
    where: { clerkId: user.id },
    data: { isActive: false },
  });
}

function verifyClerkWebhook(request: Request, payload: string): WebhookEvent | null {
  const secret = process.env.CLERK_WEBHOOK_SECRET;

  if (!secret) {
    return null;
  }

  const svixId = request.headers.get("svix-id");
  const svixTimestamp = request.headers.get("svix-timestamp");
  const svixSignature = request.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    throw new Error("Missing Svix headers");
  }

  const webhook = new Webhook(secret);

  return webhook.verify(payload, {
    "svix-id": svixId,
    "svix-timestamp": svixTimestamp,
    "svix-signature": svixSignature,
  }) as WebhookEvent;
}

export async function POST(request: Request) {
  try {
    const payload = await request.text();
    const event = verifyClerkWebhook(request, payload);

    if (!event) {
      return apiError("Clerk webhook secret is not configured", 500);
    }

    if (event.type === "user.created" || event.type === "user.updated") {
      const user = await upsertClerkUser(event.data);

      return ok({ data: { received: true, type: event.type, userId: user?.id ?? null } });
    }

    if (event.type === "user.deleted") {
      const result = await deactivateClerkUser(event.data);

      return ok({ data: { received: true, type: event.type, updated: result.count } });
    }

    return ok({ data: { received: true, type: event.type, ignored: true } });
  } catch (error) {
    if (error instanceof Error && error.message === "Missing Svix headers") {
      return apiError(error.message, 400);
    }

    return handleApiError(error);
  }
}
