import { z } from "zod";

import { PLAN_TYPES } from "@/constants/plans";
import { assetQuerySchema } from "@/lib/validators/assets";
import { emptyStringToUndefined, paginationSchema } from "@/lib/validators/common";

export const SUBSCRIPTION_STATUSES = [
  "ACTIVE",
  "CANCELLED",
  "EXPIRED",
  "PAST_DUE",
] as const;

export const PAYMENT_STATUSES = ["CREATED", "PAID", "FAILED", "REFUNDED"] as const;

export const adminAssetQuerySchema = assetQuerySchema.extend({
  isPublished: z.preprocess(emptyStringToUndefined, z.coerce.boolean().optional()),
  includeDeleted: z.coerce.boolean().default(false),
});

export const subscriptionQuerySchema = paginationSchema.extend({
  q: z.preprocess(emptyStringToUndefined, z.string().trim().min(1).max(100).optional()),
  plan: z.preprocess(emptyStringToUndefined, z.enum(PLAN_TYPES).optional()),
  status: z.preprocess(emptyStringToUndefined, z.enum(SUBSCRIPTION_STATUSES).optional()),
});

export const paymentQuerySchema = paginationSchema.extend({
  q: z.preprocess(emptyStringToUndefined, z.string().trim().min(1).max(100).optional()),
  plan: z.preprocess(emptyStringToUndefined, z.enum(PLAN_TYPES).optional()),
  status: z.preprocess(emptyStringToUndefined, z.enum(PAYMENT_STATUSES).optional()),
});

export type AdminAssetQueryInput = z.infer<typeof adminAssetQuerySchema>;
export type SubscriptionQueryInput = z.infer<typeof subscriptionQuerySchema>;
export type PaymentQueryInput = z.infer<typeof paymentQuerySchema>;
