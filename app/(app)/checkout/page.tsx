import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { CheckoutCard } from "@/components/checkout/checkout-card";
import type { PlanType } from "@/constants/plans";
import { requireDashboardUser } from "@/lib/dashboard-data";
import { getRuntimePaidPlans, getRuntimePlanById } from "@/lib/plan-settings";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Upgrade your Imagiene plan through Razorpay checkout.",
};

export const dynamic = "force-dynamic";

type CheckoutPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function getPlanId(value: string | string[] | undefined): PlanType | null {
  const plan = Array.isArray(value) ? value[0] : value;

  if (plan === "PRO" || plan === "PREMIUM") {
    return plan;
  }

  return null;
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const user = await requireDashboardUser();
  const resolvedSearchParams = await searchParams;
  const planId = getPlanId(resolvedSearchParams.plan);

  if (resolvedSearchParams.plan === "FREE") {
    redirect("/library");
  }

  if (!planId) {
    const paidPlans = await getRuntimePaidPlans();

    return (
      <main className="px-6 py-10 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-5xl space-y-8">
          <section>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">Checkout</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight">Choose a paid plan</h1>
            <p className="mt-3 text-muted-foreground">Checkout requires a Pro or Premium plan selection.</p>
          </section>
          <div className="grid gap-4 md:grid-cols-2">
            {paidPlans.map((plan) => (
              <Link key={plan.id} href={`/checkout?plan=${plan.id}`} className="rounded-3xl border bg-background p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground">{plan.name}</p>
                <p className="mt-3 text-3xl font-semibold">{plan.displayPrice}</p>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{plan.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </main>
    );
  }

  const plan = await getRuntimePlanById(planId);

  return (
    <main className="px-6 py-10 sm:px-10 lg:px-16">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_340px]">
        <CheckoutCard plan={plan} user={{ name: user.name, email: user.email }} />
        <aside className="space-y-4">
          <div className="rounded-3xl border bg-muted/20 p-6">
            <h2 className="text-xl font-semibold">What happens next?</h2>
            <div className="mt-5 space-y-4 text-sm leading-6 text-muted-foreground">
              <p>Razorpay creates a secure order for the selected plan amount.</p>
              <p>Imagiene verifies the payment signature and captured payment before updating your plan.</p>
              <p>Your subscription is activated for one month after verification succeeds.</p>
            </div>
          </div>
          <div className="rounded-3xl border bg-background p-6 shadow-sm">
            <h2 className="text-xl font-semibold">Current account</h2>
            <p className="mt-3 text-sm text-muted-foreground">{user.email}</p>
            <p className="mt-2 text-sm font-semibold">Current plan: {user.plan}</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
