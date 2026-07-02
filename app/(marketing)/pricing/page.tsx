import Link from "next/link";

import { getRuntimePlans } from "@/lib/plan-settings";

function getPlanCtaHref(planId: string) {
  if (planId === "FREE") {
    return "/library";
  }

  return `/sign-in?redirect_url=${encodeURIComponent(`/checkout?plan=${planId}`)}`;
}

export default async function PricingPage() {
  const plans = await getRuntimePlans();

  return (
    <main className="px-6 py-16 sm:px-10 lg:px-16">
      <section className="mx-auto max-w-6xl space-y-10">
        <div className="max-w-2xl space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Pricing
          </p>
          <h1 className="text-4xl font-semibold tracking-tight">
            Choose the right asset access level.
          </h1>
          <p className="text-muted-foreground">
            Start free, upgrade when you need pro or premium research visuals.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.id}
              className="flex rounded-[var(--radius-lg)] border bg-card p-6 shadow-sm md:min-h-[360px] md:flex-col"
            >
              <div>
                <h2 className="text-2xl font-semibold">{plan.name}</h2>
                <p className="mt-3 text-3xl font-bold">{plan.displayPrice}</p>
              </div>
              <p className="mt-4 min-h-16 text-sm leading-6 text-muted-foreground">
                {plan.description}
              </p>
              <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              {plan.active ? (
                <Link
                  href={getPlanCtaHref(plan.id)}
                  className="mt-6 block rounded-[var(--radius-md)] bg-primary px-5 py-3 text-center text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 md:mt-auto"
                >
                  {plan.id === "FREE" ? "Start Browsing" : "Sign in to Upgrade"}
                </Link>
              ) : (
                <p className="mt-6 rounded-[var(--radius-md)] border bg-muted px-5 py-3 text-center text-sm font-semibold text-muted-foreground md:mt-auto">
                  {plan.inactiveMessage}
                </p>
              )}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
