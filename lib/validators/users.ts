import { z } from "zod";

import { PLAN_TYPES } from "@/constants/plans";
import { emptyStringToUndefined, objectIdSchema, paginationSchema } from "@/lib/validators/common";

export const userRoleSchema = z.enum(["USER", "ADMIN"]);

export const safeProfileUpdateSchema = z.object({
  name: z.preprocess(emptyStringToUndefined, z.string().trim().min(2).max(120).optional()),
  imageUrl: z.preprocess(emptyStringToUndefined, z.string().trim().url().optional()),
});

export const adminUpdateUserSchema = z.object({
  name: z.preprocess(emptyStringToUndefined, z.string().trim().min(2).max(120).optional()),
  imageUrl: z.preprocess(emptyStringToUndefined, z.string().trim().url().optional()),
  role: userRoleSchema.optional(),
  plan: z.enum(PLAN_TYPES).optional(),
  isActive: z.coerce.boolean().optional(),
});

export const userQuerySchema = paginationSchema.extend({
  q: z.preprocess(emptyStringToUndefined, z.string().trim().min(1).max(100).optional()),
  role: z.preprocess(emptyStringToUndefined, userRoleSchema.optional()),
  plan: z.preprocess(emptyStringToUndefined, z.enum(PLAN_TYPES).optional()),
});

export const userIdParamsSchema = z.object({
  userId: objectIdSchema,
});

export type SafeProfileUpdateInput = z.infer<typeof safeProfileUpdateSchema>;
export type AdminUpdateUserInput = z.infer<typeof adminUpdateUserSchema>;
export type UserQueryInput = z.infer<typeof userQuerySchema>;
