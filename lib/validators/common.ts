import { z } from "zod";

export const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Expected a MongoDB ObjectId");

export const nonEmptyStringSchema = z.string().trim().min(1);

export const optionalUrlSchema = z
  .string()
  .trim()
  .url()
  .optional()
  .or(z.literal(""));

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(24),
});

export function emptyStringToUndefined(value: unknown) {
  return value === "" ? undefined : value;
}
