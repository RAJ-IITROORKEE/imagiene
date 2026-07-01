import Link from "next/link";
import type { Subscription } from "@/lib/generated/prisma";

import type { Plan } from "@/constants/plans";

function formatDate(date: Date | null) {
  if (!date) {
    return "Not scheduled";
  }

  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(date);
}

type PlanCardProps = {
  plan: Plan;
  subscription?: Subscription | null;
};

export function PlanCard({ plan, subscription }: PlanCardProps) {
  const isFree = plan.id === "FREE";

  return (
    <section className="rounded-3xl border bg-muted/20 p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground">Current plan</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">{plan.name}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{plan.description}</p>
        </div>
        <Link
          href={isFree ? "/#pricing" : "/dashboard/billing"}
          className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-background transition hover:opacity-90"
        >
          {isFree ? "Upgrade access" : "Manage billing"}
        </Link>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border bg-background p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Price</p>
          <p className="mt-2 font-semibold">{plan.displayPrice}</p>
        </div>
        <div className="rounded-2xl border bg-background p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Status</p>
          <p className="mt-2 font-semibold">{subscription?.status ?? "FREE"}</p>
        </div>
        <div className="rounded-2xl border bg-background p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Renews</p>
          <p className="mt-2 font-semibold">{formatDate(subscription?.expiresAt ?? null)}</p>
        </div>
      </div>
    </section>
  );
}
