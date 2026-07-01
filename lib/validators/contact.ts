import { z } from "zod";

import { emptyStringToUndefined, objectIdSchema, paginationSchema } from "@/lib/validators/common";

export const contactStatusSchema = z.enum(["NEW", "READ", "RESOLVED"]);

export const createContactMessageSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(120),
  email: z.string().trim().email("Enter a valid email address").max(180),
  subject: z.string().trim().min(4, "Subject must be at least 4 characters").max(160),
  message: z.string().trim().min(12, "Message must be at least 12 characters").max(4_000),
});

export const contactMessageQuerySchema = paginationSchema.extend({
  q: z.preprocess(emptyStringToUndefined, z.string().trim().min(1).max(100).optional()),
  status: z.preprocess(emptyStringToUndefined, contactStatusSchema.optional()),
});

export const contactMessageParamsSchema = z.object({
  messageId: objectIdSchema,
});

export const updateContactMessageSchema = z.object({
  status: contactStatusSchema,
});

export type CreateContactMessageInput = z.infer<typeof createContactMessageSchema>;
