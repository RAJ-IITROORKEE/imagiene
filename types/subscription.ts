import type { PlanType } from "@/constants/plans";

export type SubscriptionStatus = "ACTIVE" | "CANCELLED" | "EXPIRED" | "PAST_DUE";

export type PaymentStatus = "CREATED" | "PAID" | "FAILED" | "REFUNDED";

export type Subscription = {
  id: string;
  userId: string;
  plan: PlanType;
  status: SubscriptionStatus;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  startedAt?: string | Date | null;
  expiresAt?: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export type Payment = {
  id: string;
  userId: string;
  amount: number;
  currency: "INR";
  plan: PlanType;
  status: PaymentStatus;
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  razorpaySignature?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};
