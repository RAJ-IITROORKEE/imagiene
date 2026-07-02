"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  getAdminApiErrorMessage,
  parseAdminApiResponse,
} from "@/components/admin/admin-form-response";
import type { RuntimePlan } from "@/lib/plan-settings";

type AdminPlanSettingsFormProps = {
  plans: RuntimePlan[];
};

export function AdminPlanSettingsForm({ plans }: AdminPlanSettingsFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(formData: FormData) {
    setError(null);
    const payload = {
      plans: plans.map((plan) => ({
        plan: plan.id,
        priceMonthlyInr: Number(formData.get(`${plan.id}:priceMonthlyInr`) ?? plan.priceMonthlyInr),
        active: formData.get(`${plan.id}:active`) === "on",
        inactiveMessage: String(formData.get(`${plan.id}:inactiveMessage`) ?? ""),
      })),
    };

    startTransition(async () => {
      const response = await fetch("/api/admin/settings/plans", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await parseAdminApiResponse(response);

      if (!response.ok) {
        const message = getAdminApiErrorMessage(result, "Plan settings could not be updated.");
        setError(message);
        toast.error(message);
        return;
      }

      toast.success("Plan settings updated");
    });
  }

  return (
    <form action={onSubmit} className="rounded-[2rem] border bg-background p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">Pricing controls</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight">Plans and availability</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Update monthly INR pricing, pause a tier, and set the message users see when a tier is inactive.
          </p>
        </div>
        <button disabled={isPending} className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-background transition hover:opacity-90 disabled:opacity-60">
          {isPending ? "Saving..." : "Save pricing"}
        </button>
      </div>

      {error ? <p className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300">{error}</p> : null}

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {plans.map((plan) => (
          <article key={plan.id} className="rounded-3xl border bg-muted/20 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{plan.id}</p>
                <h3 className="mt-2 text-xl font-semibold">{plan.name}</h3>
              </div>
              <label className="flex items-center gap-2 rounded-full border bg-background px-3 py-2 text-xs font-semibold">
                <input name={`${plan.id}:active`} type="checkbox" defaultChecked={plan.active} className="size-4" />
                Active
              </label>
            </div>
            <label className="mt-5 grid gap-2 text-sm font-medium">
              Monthly price (INR)
              <input
                name={`${plan.id}:priceMonthlyInr`}
                type="number"
                min="0"
                step="1"
                defaultValue={plan.priceMonthlyInr}
                className="rounded-2xl border bg-background px-4 py-3 font-normal outline-none transition focus:border-foreground"
              />
            </label>
            <label className="mt-4 grid gap-2 text-sm font-medium">
              Inactive frontend message
              <textarea
                name={`${plan.id}:inactiveMessage`}
                defaultValue={plan.inactiveMessage}
                rows={3}
                className="resize-none rounded-2xl border bg-background px-4 py-3 font-normal outline-none transition focus:border-foreground"
                placeholder="Premium features coming soon."
              />
            </label>
            <p className="mt-4 rounded-2xl border bg-background px-4 py-3 text-sm text-muted-foreground">
              Current display: <span className="font-semibold text-foreground">{plan.displayPrice}</span>
            </p>
          </article>
        ))}
      </div>
    </form>
  );
}
