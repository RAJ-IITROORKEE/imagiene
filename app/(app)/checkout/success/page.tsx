import Link from "next/link";
import type { Metadata } from "next";

import { getDashboardBillingData } from "@/lib/dashboard-data";

export const metadata: Metadata = {
  title: "Payment Success",
  description: "Your Imagiene subscription has been updated.",
};

export const dynamic = "force-dynamic";

function formatDate(date: Date | null | undefined) {
  if (!date) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(date);
}

export default async function CheckoutSuccessPage() {
  const data = await getDashboardBillingData();

  return (
    <main className="px-6 py-10 sm:px-10 lg:px-16">
      <section className="mx-auto max-w-3xl rounded-[2rem] border bg-muted/20 p-8 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">Payment verified</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">Your {data.plan.name} access is active</h1>
        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
          Imagiene has verified the Razorpay payment and updated your asset access level.
        </p>
        <div className="mt-8 grid gap-3 text-left sm:grid-cols-3">
          <div className="rounded-2xl border bg-background p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Plan</p>
            <p className="mt-2 font-semibold">{data.plan.name}</p>
          </div>
          <div className="rounded-2xl border bg-background p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Status</p>
            <p className="mt-2 font-semibold">{data.activeSubscription?.status ?? data.user.plan}</p>
          </div>
          <div className="rounded-2xl border bg-background p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Expires</p>
            <p className="mt-2 font-semibold">{formatDate(data.activeSubscription?.expiresAt)}</p>
          </div>
        </div>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/library" className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-background">
            Browse library
          </Link>
          <Link href="/dashboard/billing" className="rounded-full border px-5 py-3 text-sm font-semibold">
            View billing
          </Link>
        </div>
      </section>
    </main>
  );
}
