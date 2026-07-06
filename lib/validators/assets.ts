import { z } from "zod";

import { ASSET_ACCESS_LEVELS, ASSET_TYPES } from "@/constants/asset-types";
import {
  emptyStringToUndefined,
  objectIdSchema,
  paginationSchema,
} from "@/lib/validators/common";

export const assetSortSchema = z.enum(["newest", "popular", "title"]);

export const createAssetSchema = z.object({
  title: z.string().trim().min(3).max(140),
  slug: z
    .preprocess(
      emptyStringToUndefined,
      z
        .string()
        .trim()
        .min(3)
        .max(160)
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
        .optional(),
    ),
  description: z.string().trim().max(5_000).default(""),
  type: z.enum(ASSET_TYPES),
  accessLevel: z.enum(ASSET_ACCESS_LEVELS).default("FREE"),
  fileUrl: z.string().trim().min(1).max(1_024),
  previewUrl: z.string().trim().min(1).max(1_024),
  format: z.string().trim().min(1).max(20),
  width: z.preprocess(emptyStringToUndefined, z.coerce.number().int().positive().optional()),
  height: z.preprocess(emptyStringToUndefined, z.coerce.number().int().positive().optional()),
  fileSize: z.preprocess(emptyStringToUndefined, z.coerce.number().int().positive().optional()),
  categoryId: objectIdSchema,
  tagIds: z.array(objectIdSchema).max(20).default([]),
  tagNames: z.array(z.string().trim().min(2).max(60)).max(20).default([]),
  isPublished: z.coerce.boolean().default(false),
});

export const updateAssetSchema = createAssetSchema.partial().extend({
  tagIds: z.array(objectIdSchema).max(20).optional(),
  tagNames: z.array(z.string().trim().min(2).max(60)).max(20).optional(),
});

export const assetQuerySchema = paginationSchema.extend({
  q: z.preprocess(emptyStringToUndefined, z.string().trim().min(1).max(100).optional()),
  type: z.preprocess(emptyStringToUndefined, z.enum(ASSET_TYPES).optional()),
  accessLevel: z.preprocess(
    emptyStringToUndefined,
    z.enum(ASSET_ACCESS_LEVELS).optional(),
  ),
  categoryId: z.preprocess(emptyStringToUndefined, objectIdSchema.optional()),
  tagId: z.preprocess(emptyStringToUndefined, objectIdSchema.optional()),
  sort: assetSortSchema.default("newest"),
});

export const assetIdParamsSchema = z.object({
  assetId: objectIdSchema,
});

export type CreateAssetInput = z.infer<typeof createAssetSchema>;
export type UpdateAssetInput = z.infer<typeof updateAssetSchema>;
export type AssetQueryInput = z.infer<typeof assetQuerySchema>;
