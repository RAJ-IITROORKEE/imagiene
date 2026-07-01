import type { AssetAccessLevel, PlanType, User, UserRole } from "@/lib/generated/prisma";

const PLAN_RANK: Record<PlanType, number> = {
  FREE: 0,
  PRO: 1,
  PREMIUM: 2,
};

export function isAdminRole(role: UserRole): boolean {
  return role === "ADMIN";
}

export function isAdmin(user: Pick<User, "role"> | null | undefined): boolean {
  return user?.role === "ADMIN";
}

export function isActiveUser(
  user: Pick<User, "isActive"> | null | undefined,
): boolean {
  return user?.isActive === true;
}

export function isPaidPlan(plan: PlanType): boolean {
  return plan === "PRO" || plan === "PREMIUM";
}

export function canAccessPlan(
  userPlan: PlanType | null | undefined,
  requiredPlan: AssetAccessLevel | PlanType,
): boolean {
  return PLAN_RANK[userPlan ?? "FREE"] >= PLAN_RANK[requiredPlan as PlanType];
}

export function canManageAssets(user: Pick<User, "role" | "isActive"> | null): boolean {
  return isActiveUser(user) && isAdmin(user);
}

export function canManageUsers(user: Pick<User, "role" | "isActive"> | null): boolean {
  return isActiveUser(user) && isAdmin(user);
}

export function canViewAdmin(user: Pick<User, "role" | "isActive"> | null): boolean {
  return isActiveUser(user) && isAdmin(user);
}
