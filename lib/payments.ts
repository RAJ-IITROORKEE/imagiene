import crypto from "node:crypto";

import type { Payment } from "@prisma/client";

import { planById } from "@/constants/plans";
import { prisma } from "@/lib/prisma";
import { requireRazorpay } from "@/lib/razorpay";

const SUBSCRIPTION_MONTHS = 1;

export class PaymentProcessingError extends Error {
  constructor(
    message: string,
    public readonly status = 400,
  ) {
    super(message);
    this.name = "PaymentProcessingError";
  }
}

export function createRazorpaySignature(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

export function isValidRazorpaySignature(
  payload: string,
  signature: string,
  secret: string,
): boolean {
  const expected = Buffer.from(createRazorpaySignature(payload, secret), "hex");
  const actual = Buffer.from(signature, "hex");

  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

export function verifyCheckoutSignature(input: {
  orderId: string;
  paymentId: string;
  signature: string;
}): void {
  const secret = process.env.RAZORPAY_KEY_SECRET;

  if (!secret) {
    throw new PaymentProcessingError("Razorpay secret is not configured", 500);
  }

  const payload = `${input.orderId}|${input.paymentId}`;

  if (!isValidRazorpaySignature(payload, input.signature, secret)) {
    throw new PaymentProcessingError("Invalid payment signature", 400);
  }
}

export function verifyWebhookSignature(payload: string, signature: string): void {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!secret) {
    throw new PaymentProcessingError("Razorpay webhook secret is not configured", 500);
  }

  if (!isValidRazorpaySignature(payload, signature, secret)) {
    throw new PaymentProcessingError("Invalid webhook signature", 400);
  }
}

export async function fetchCapturedRazorpayPayment(input: {
  orderId: string;
  paymentId: string;
  expectedAmount: number;
}) {
  const razorpayPayment = await requireRazorpay().payments.fetch(input.paymentId);

  if (razorpayPayment.order_id !== input.orderId) {
    throw new PaymentProcessingError("Payment does not belong to this order", 400);
  }

  if (Number(razorpayPayment.amount) !== input.expectedAmount) {
    throw new PaymentProcessingError("Payment amount mismatch", 400);
  }

  if (razorpayPayment.currency !== "INR") {
    throw new PaymentProcessingError("Payment currency mismatch", 400);
  }

  if (razorpayPayment.status !== "captured" || !razorpayPayment.captured) {
    throw new PaymentProcessingError("Payment is not captured", 400);
  }

  return razorpayPayment;
}

export function getPlanAmount(payment: Pick<Payment, "plan">): number {
  return planById[payment.plan].priceMonthlyPaise;
}

export function getSubscriptionExpiry(startedAt: Date): Date {
  const expiresAt = new Date(startedAt);
  expiresAt.setMonth(expiresAt.getMonth() + SUBSCRIPTION_MONTHS);
  return expiresAt;
}

export async function activatePaidSubscription(input: {
  payment: Payment;
  razorpayPaymentId: string;
  razorpaySignature?: string;
}) {
  const startedAt = new Date();
  const expiresAt = getSubscriptionExpiry(startedAt);

  return prisma.$transaction(async (tx) => {
    const paidPayment = await tx.payment.update({
      where: { id: input.payment.id },
      data: {
        status: "PAID",
        razorpayPaymentId: input.razorpayPaymentId,
        razorpaySignature: input.razorpaySignature,
      },
    });

    const existingSubscription = await tx.subscription.findFirst({
      where: {
        userId: input.payment.userId,
        razorpayPaymentId: input.razorpayPaymentId,
      },
    });

    const subscription =
      existingSubscription ??
      (await tx.subscription.create({
        data: {
          userId: input.payment.userId,
          plan: input.payment.plan,
          status: "ACTIVE",
          razorpayOrderId: input.payment.razorpayOrderId,
          razorpayPaymentId: input.razorpayPaymentId,
          startedAt,
          expiresAt,
        },
      }));

    await tx.subscription.updateMany({
      where: {
        userId: input.payment.userId,
        status: "ACTIVE",
        id: { not: subscription.id },
      },
      data: { status: "CANCELLED" },
    });

    const user = await tx.user.update({
      where: { id: input.payment.userId },
      data: { plan: input.payment.plan },
    });

    return {
      payment: paidPayment,
      subscription,
      user,
    };
  });
}
