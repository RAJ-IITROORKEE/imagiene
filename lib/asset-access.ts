import type { Asset, User } from "@prisma/client";

import { canAccessPlan, isAdmin } from "@/lib/permissions";

type AccessAsset = Pick<
  Asset,
  "accessLevel" | "deletedAt" | "isPublished" | "title"
>;

type AccessUser = Pick<User, "isActive" | "plan" | "role"> | null;

export type AssetAccessDecision = {
  allowed: boolean;
  reason?: "inactive" | "unpublished" | "deleted" | "subscription";
  requiredPlan: AccessAsset["accessLevel"];
  userPlan: AccessUser extends null ? never : User["plan"] | "FREE";
};

export function getAssetAccessDecision(
  user: AccessUser,
  asset: AccessAsset,
): AssetAccessDecision {
  const userPlan = user?.plan ?? "FREE";

  if (asset.deletedAt) {
    return {
      allowed: false,
      reason: "deleted",
      requiredPlan: asset.accessLevel,
      userPlan,
    };
  }

  if (!asset.isPublished && !isAdmin(user)) {
    return {
      allowed: false,
      reason: "unpublished",
      requiredPlan: asset.accessLevel,
      userPlan,
    };
  }

  if (user && !user.isActive) {
    return {
      allowed: false,
      reason: "inactive",
      requiredPlan: asset.accessLevel,
      userPlan,
    };
  }

  if (isAdmin(user) || canAccessPlan(userPlan, asset.accessLevel)) {
    return {
      allowed: true,
      requiredPlan: asset.accessLevel,
      userPlan,
    };
  }

  return {
    allowed: false,
    reason: "subscription",
    requiredPlan: asset.accessLevel,
    userPlan,
  };
}

export function canAccessAsset(user: AccessUser, asset: AccessAsset): boolean {
  return getAssetAccessDecision(user, asset).allowed;
}

export function getAssetAccessMessage(decision: AssetAccessDecision): string | null {
  if (decision.allowed) {
    return null;
  }

  if (decision.reason === "subscription") {
    return `Upgrade to ${decision.requiredPlan.toLowerCase()} to access this asset.`;
  }

  if (decision.reason === "inactive") {
    return "Your account is inactive. Contact support to restore access.";
  }

  if (decision.reason === "unpublished") {
    return "This asset is not published yet.";
  }

  return "This asset is no longer available.";
}
