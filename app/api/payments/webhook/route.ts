import { NextRequest } from "next/server";

import { apiError, handleApiError, ok } from "@/lib/api-response";
import {
  activatePaidSubscription,
  fetchCapturedRazorpayPayment,
  getPlanAmount,
  PaymentProcessingError,
  verifyWebhookSignature,
} from "@/lib/payments";
import { prisma } from "@/lib/prisma";
import { razorpayWebhookHeadersSchema } from "@/lib/validators";

export const runtime = "nodejs";

type RazorpayWebhookEntity = {
  id?: string;
  order_id?: string;
  status?: string;
};

type RazorpayWebhookEvent = {
  event?: string;
  payload?: {
    payment?: { entity?: RazorpayWebhookEntity };
    order?: { entity?: RazorpayWebhookEntity };
  };
};

async function markPaymentFailed(orderId: string | undefined) {
  if (!orderId) {
    return null;
  }

  return prisma.payment.updateMany({
    where: {
      razorpayOrderId: orderId,
      status: { not: "PAID" },
    },
    data: { status: "FAILED" },
  });
}

async function markPaymentPaid(input: { orderId?: string; paymentId?: string }) {
  if (!input.orderId || !input.paymentId) {
    return null;
  }

  const payment = await prisma.payment.findUnique({
    where: { razorpayOrderId: input.orderId },
  });

  if (!payment) {
    return null;
  }

  if (payment.status === "PAID" && payment.razorpayPaymentId === input.paymentId) {
    return { alreadyVerified: true, payment };
  }

  await fetchCapturedRazorpayPayment({
    orderId: input.orderId,
    paymentId: input.paymentId,
    expectedAmount: getPlanAmount(payment),
  });

  return activatePaidSubscription({
    payment,
    razorpayPaymentId: input.paymentId,
  });
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.text();
    const headers = razorpayWebhookHeadersSchema.parse({
      "x-razorpay-signature": request.headers.get("x-razorpay-signature"),
    });

    verifyWebhookSignature(payload, headers["x-razorpay-signature"]);

    const event = JSON.parse(payload) as RazorpayWebhookEvent;
    const paymentEntity = event.payload?.payment?.entity;
    const orderEntity = event.payload?.order?.entity;

    if (event.event === "payment.captured") {
      const result = await markPaymentPaid({
        orderId: paymentEntity?.order_id,
        paymentId: paymentEntity?.id,
      });

      return ok({ received: true, event: event.event, data: result });
    }

    if (event.event === "order.paid") {
      const result = await markPaymentPaid({
        orderId: orderEntity?.id ?? paymentEntity?.order_id,
        paymentId: paymentEntity?.id,
      });

      return ok({ received: true, event: event.event, data: result });
    }

    if (event.event === "payment.failed") {
      const result = await markPaymentFailed(paymentEntity?.order_id);

      return ok({ received: true, event: event.event, data: result });
    }

    return ok({ received: true, event: event.event ?? "unknown", ignored: true });
  } catch (error) {
    if (error instanceof PaymentProcessingError) {
      return apiError(error.message, error.status);
    }

    return handleApiError(error);
  }
}
