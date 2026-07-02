import { NextRequest } from "next/server";

import { apiError, handleApiError, ok } from "@/lib/api-response";
import { syncCurrentUser } from "@/lib/auth";
import { PaymentProcessingError } from "@/lib/payments";
import { getRuntimePlanById } from "@/lib/plan-settings";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { getRazorpayKeyId, requireRazorpay } from "@/lib/razorpay";
import { createRazorpayOrderSchema } from "@/lib/validators";

export const runtime = "nodejs";

function createReceipt(): string {
  return `img_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function POST(request: NextRequest) {
  try {
    const user = await syncCurrentUser();

    if (!user) {
      return apiError("Authentication required", 401);
    }

    const limited = await checkRateLimit(`payment-order:${user.id}`, {
      prefix: "api:payment-orders",
      limit: 5,
      window: "10 m",
    });

    if (limited) {
      return limited;
    }

    const input = createRazorpayOrderSchema.parse(await request.json());
    const plan = await getRuntimePlanById(input.plan);

    if (!plan.active) {
      return apiError(plan.inactiveMessage, 409);
    }

    const razorpay = requireRazorpay();
    const keyId = getRazorpayKeyId();

    if (!keyId) {
      throw new PaymentProcessingError("Razorpay key is not configured", 500);
    }

    const order = await razorpay.orders.create({
      amount: plan.priceMonthlyPaise,
      currency: "INR",
      receipt: createReceipt(),
      notes: {
        userId: user.id,
        clerkId: user.clerkId,
        plan: plan.id,
      },
    });

    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        amount: plan.priceMonthlyPaise,
        currency: "INR",
        plan: plan.id,
        status: "CREATED",
        razorpayOrderId: order.id,
      },
    });

    return ok(
      {
        data: {
          paymentId: payment.id,
          orderId: order.id,
          keyId,
          amount: plan.priceMonthlyPaise,
          currency: "INR",
          plan: plan.id,
          planName: plan.name,
          receipt: order.receipt,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof PaymentProcessingError) {
      return apiError(error.message, error.status);
    }

    return handleApiError(error);
  }
}
