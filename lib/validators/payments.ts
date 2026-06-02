import { z } from "zod";

import { PLAN_TYPES } from "@/constants/plans";

export const paidPlanSchema = z.enum(PLAN_TYPES).refine((plan) => plan !== "FREE", {
  message: "Free plan does not require payment",
});

export const createRazorpayOrderSchema = z.object({
  plan: paidPlanSchema,
});

export const verifyRazorpayPaymentSchema = z.object({
  razorpay_order_id: z.string().trim().min(1),
  razorpay_payment_id: z.string().trim().min(1),
  razorpay_signature: z.string().trim().min(1),
});

export const razorpayWebhookHeadersSchema = z.object({
  "x-razorpay-signature": z.string().trim().min(1),
});

export type CreateRazorpayOrderInput = z.infer<typeof createRazorpayOrderSchema>;
export type VerifyRazorpayPaymentInput = z.infer<typeof verifyRazorpayPaymentSchema>;
