import Link from "next/link";
import type { Metadata } from "next";

import { PlanCard } from "@/components/dashboard/plan-card";
import { getDashboardBillingData } from "@/lib/dashboard-data";
import { getRuntimePaidPlans } from "@/lib/plan-settings";
import { formatInr } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Billing",
  description: "Manage Imagiene plan and payment history.",
};

export const dynamic = "force-dynamic";

function formatDate(date: Date | null) {
  if (!date) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(date);
}

export default async function BillingPage() {
  const data = await getDashboardBillingData();
  const paidPlans = await getRuntimePaidPlans();

  return (
    <main className="px-6 py-10 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-6xl space-y-8">
        <section>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">Billing</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">Plan and payment history</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Your plan is updated automatically after Razorpay payment verification.
          </p>
        </section>

        <PlanCard plan={data.plan} subscription={data.activeSubscription} />

        <section className="grid gap-4 md:grid-cols-2">
          {paidPlans.map((plan) => (
            <div key={plan.id} className="rounded-3xl border bg-background p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground">Upgrade option</p>
              <h2 className="mt-3 text-2xl font-semibold">{plan.name}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{plan.description}</p>
              <p className="mt-4 text-xl font-semibold">{plan.displayPrice}</p>
              {plan.active ? (
                <Link
                  href={`/checkout?plan=${plan.id}`}
                  className="mt-5 inline-flex rounded-full bg-primary px-5 py-3 text-sm font-semibold text-background"
                >
                  Choose {plan.name}
                </Link>
              ) : (
                <p className="mt-5 rounded-2xl border bg-muted px-4 py-3 text-sm font-semibold text-muted-foreground">{plan.inactiveMessage}</p>
              )}
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border bg-background p-6 shadow-sm">
            <h2 className="text-2xl font-semibold tracking-tight">Subscriptions</h2>
            <div className="mt-5 space-y-3">
              {data.subscriptions.length ? (
                data.subscriptions.map((subscription) => (
                  <div key={subscription.id} className="rounded-2xl border p-4 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold">{subscription.plan}</span>
                      <span className="rounded-full bg-muted px-2 py-1 text-xs font-semibold">{subscription.status}</span>
                    </div>
                    <p className="mt-2 text-muted-foreground">
                      {formatDate(subscription.startedAt)} - {formatDate(subscription.expiresAt)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-6 text-muted-foreground">Subscription records appear after your first paid checkout.</p>
              )}
            </div>
          </div>

          <div className="rounded-3xl border bg-background p-6 shadow-sm">
            <h2 className="text-2xl font-semibold tracking-tight">Payments</h2>
            <div className="mt-5 space-y-3">
              {data.payments.length ? (
                data.payments.map((payment) => (
                  <div key={payment.id} className="rounded-2xl border p-4 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold">{payment.plan}</span>
                      <span className="rounded-full bg-muted px-2 py-1 text-xs font-semibold">{payment.status}</span>
                    </div>
                    <p className="mt-2 text-muted-foreground">
                      {formatInr(payment.amount / 100)} on {formatDate(payment.createdAt)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-6 text-muted-foreground">Payment attempts and successful checkouts will appear here.</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
