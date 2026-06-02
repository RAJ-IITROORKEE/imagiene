"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import type { Plan, PlanType } from "@/constants/plans";

type CheckoutCardProps = {
  plan: Plan;
  user: {
    name: string | null;
    email: string;
  };
};

type RazorpayOrderResponse = {
  data?: {
    orderId: string;
    keyId: string;
    amount: number;
    currency: string;
    plan: PlanType;
    planName: string;
  };
  error?: {
    message?: string;
  };
};

type RazorpayVerifyResponse = {
  data?: {
    alreadyVerified: boolean;
  };
  error?: {
    message?: string;
  };
};

type RazorpaySuccessResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayFailureResponse = {
  error?: {
    description?: string;
  };
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name?: string;
    email: string;
  };
  theme: {
    color: string;
  };
  handler: (response: RazorpaySuccessResponse) => void;
};

type RazorpayInstance = {
  open: () => void;
  on: (eventName: "payment.failed", callback: (response: RazorpayFailureResponse) => void) => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

const RAZORPAY_SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

async function loadRazorpayScript() {
  if (window.Razorpay) {
    return true;
  }

  return new Promise<boolean>((resolve) => {
    const existingScript = document.querySelector(`script[src="${RAZORPAY_SCRIPT_SRC}"]`);

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true), { once: true });
      existingScript.addEventListener("error", () => resolve(false), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function CheckoutCard({ plan, user }: CheckoutCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function startCheckout() {
    setError(null);

    startTransition(async () => {
      const loaded = await loadRazorpayScript();

      if (!loaded || !window.Razorpay) {
        setError("Razorpay checkout could not be loaded. Check your connection and try again.");
        return;
      }

      const orderResponse = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: plan.id }),
      });
      const orderPayload = (await orderResponse.json()) as RazorpayOrderResponse;

      if (!orderResponse.ok || !orderPayload.data) {
        setError(orderPayload.error?.message ?? "Could not create a payment order.");
        return;
      }

      const checkout = new window.Razorpay({
        key: orderPayload.data.keyId,
        amount: orderPayload.data.amount,
        currency: orderPayload.data.currency,
        name: "Imagiene",
        description: `${orderPayload.data.planName} monthly access`,
        order_id: orderPayload.data.orderId,
        prefill: {
          name: user.name ?? undefined,
          email: user.email,
        },
        theme: {
          color: "#111111",
        },
        handler: async (response) => {
          const verifyResponse = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          const verifyPayload = (await verifyResponse.json()) as RazorpayVerifyResponse;

          if (!verifyResponse.ok) {
            setError(verifyPayload.error?.message ?? "Payment verification failed.");
            toast.error("Payment verification failed");
            return;
          }

          toast.success(verifyPayload.data?.alreadyVerified ? "Payment already verified" : "Payment verified");
          router.push(`/checkout/success?plan=${plan.id}&payment_id=${response.razorpay_payment_id}`);
          router.refresh();
        },
      });

      checkout.on("payment.failed", (response) => {
        setError(response.error?.description ?? "Payment failed or was cancelled.");
        toast.error("Payment failed");
      });

      checkout.open();
    });
  }

  return (
    <section className="rounded-[2rem] border bg-background p-6 shadow-sm">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground">Secure checkout</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Upgrade to {plan.name}</h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">{plan.description}</p>
        </div>
        <div className="rounded-3xl border bg-muted/20 p-5 text-right">
          <p className="text-sm text-muted-foreground">Monthly plan</p>
          <p className="mt-2 text-3xl font-semibold">{plan.displayPrice}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {plan.features.map((feature) => (
          <div key={feature} className="rounded-2xl border bg-muted/20 p-4 text-sm font-medium">
            {feature}
          </div>
        ))}
      </div>

      {error ? <p className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-950 dark:bg-red-950/30 dark:text-red-200">{error}</p> : null}

      <button
        type="button"
        onClick={startCheckout}
        disabled={isPending}
        className="mt-8 w-full rounded-full bg-primary px-6 py-4 text-sm font-semibold text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {isPending ? "Preparing checkout..." : `Pay ${plan.displayPrice}`}
      </button>
    </section>
  );
}
