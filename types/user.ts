import type { PlanType } from "@/constants/plans";

export type UserRole = "USER" | "ADMIN";

export type AppUser = {
  id: string;
  clerkId: string;
  email: string;
  name?: string | null;
  imageUrl?: string | null;
  role: UserRole;
  plan: PlanType;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export type SafeUserUpdate = {
  name?: string;
  imageUrl?: string;
};
