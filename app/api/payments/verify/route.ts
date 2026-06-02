import { NextRequest } from "next/server";

import { apiError, handleApiError, ok } from "@/lib/api-response";
import { syncCurrentUser } from "@/lib/auth";
import {
  activatePaidSubscription,
  fetchCapturedRazorpayPayment,
  getPlanAmount,
  PaymentProcessingError,
  verifyCheckoutSignature,
} from "@/lib/payments";
import { prisma } from "@/lib/prisma";
import { verifyRazorpayPaymentSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const user = await syncCurrentUser();

    if (!user) {
      return apiError("Authentication required", 401);
    }

    const input = verifyRazorpayPaymentSchema.parse(await request.json());
    const payment = await prisma.payment.findUnique({
      where: { razorpayOrderId: input.razorpay_order_id },
    });

    if (!payment) {
      return apiError("Payment order not found", 404);
    }

    if (payment.userId !== user.id) {
      return apiError("Payment order does not belong to this user", 403);
    }

    verifyCheckoutSignature({
      orderId: input.razorpay_order_id,
      paymentId: input.razorpay_payment_id,
      signature: input.razorpay_signature,
    });

    if (
      payment.status === "PAID" &&
      payment.razorpayPaymentId === input.razorpay_payment_id
    ) {
      const subscription = await prisma.subscription.findFirst({
        where: {
          userId: user.id,
          razorpayPaymentId: input.razorpay_payment_id,
        },
      });

      return ok({
        data: {
          payment,
          subscription,
          alreadyVerified: true,
        },
      });
    }

    await fetchCapturedRazorpayPayment({
      orderId: input.razorpay_order_id,
      paymentId: input.razorpay_payment_id,
      expectedAmount: getPlanAmount(payment),
    });

    const result = await activatePaidSubscription({
      payment,
      razorpayPaymentId: input.razorpay_payment_id,
      razorpaySignature: input.razorpay_signature,
    });

    return ok({ data: { ...result, alreadyVerified: false } });
  } catch (error) {
    if (error instanceof PaymentProcessingError) {
      return apiError(error.message, error.status);
    }

    return handleApiError(error);
  }
}
