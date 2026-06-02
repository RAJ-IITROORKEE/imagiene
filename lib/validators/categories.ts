import { z } from "zod";

import {
  emptyStringToUndefined,
  objectIdSchema,
  paginationSchema,
} from "@/lib/validators/common";

const slugSchema = z
  .string()
  .trim()
  .min(2)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export const createCategorySchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z.preprocess(emptyStringToUndefined, slugSchema.optional()),
  description: z.preprocess(
    emptyStringToUndefined,
    z.string().trim().max(500).optional(),
  ),
});

export const updateCategorySchema = createCategorySchema.partial();

export const createTagSchema = z.object({
  name: z.string().trim().min(2).max(60),
  slug: z.preprocess(emptyStringToUndefined, slugSchema.optional()),
});

export const updateTagSchema = createTagSchema.partial();

export const categoryQuerySchema = paginationSchema.extend({
  q: z.preprocess(emptyStringToUndefined, z.string().trim().min(1).max(100).optional()),
});

export const categoryIdParamsSchema = z.object({
  categoryId: objectIdSchema,
});

export const tagIdParamsSchema = z.object({
  tagId: objectIdSchema,
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateTagInput = z.infer<typeof createTagSchema>;
export type UpdateTagInput = z.infer<typeof updateTagSchema>;
