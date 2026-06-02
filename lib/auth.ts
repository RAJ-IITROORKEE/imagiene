import { auth, currentUser } from "@clerk/nextjs/server";
import type { User } from "@prisma/client";

import { getDefaultRoleForEmail } from "@/lib/default-admin";
import { prisma } from "@/lib/prisma";

export class UnauthorizedError extends Error {
  constructor(message = "Authentication required") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  return prisma.user.findUnique({
    where: { clerkId: userId },
  });
}

export async function requireCurrentUser(): Promise<User> {
  const user = await getCurrentUser();

  if (user) {
    if (getDefaultRoleForEmail(user.email) === "ADMIN" && user.role !== "ADMIN") {
      return prisma.user.update({
        where: { id: user.id },
        data: { isActive: true, role: "ADMIN" },
      });
    }

    return user;
  }

  const syncedUser = await syncCurrentUser();

  if (!syncedUser) {
    throw new UnauthorizedError();
  }

  return syncedUser;
}

export async function getCurrentUserId(): Promise<string | null> {
  const user = await getCurrentUser();

  return user?.id ?? null;
}

export async function syncCurrentUser(): Promise<User | null> {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return null;
  }

  const primaryEmail = clerkUser.emailAddresses.find(
    (email) => email.id === clerkUser.primaryEmailAddressId,
  );
  const email = primaryEmail?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;

  if (!email) {
    throw new UnauthorizedError("Authenticated Clerk user has no email address");
  }

  const role = getDefaultRoleForEmail(email);

  return prisma.user.upsert({
    where: { clerkId: clerkUser.id },
    create: {
      clerkId: clerkUser.id,
      email,
      imageUrl: clerkUser.imageUrl,
      name: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null,
      role,
    },
    update: {
      email,
      imageUrl: clerkUser.imageUrl,
      name: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || null,
      isActive: true,
      role: role === "ADMIN" ? role : undefined,
    },
  });
}
