import Link from "next/link";
import { Atom, Check, Dna, FlaskConical, Microscope, Network, Sparkles } from "lucide-react";

import { getProtectedAssetPreviewUrl } from "@/lib/asset-preview";
import { getRuntimePlans } from "@/lib/plan-settings";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const stats = [
  { value: "6", label: "asset formats planned for launch" },
  { value: "3", label: "clear access levels for teams" },
  { value: "1", label: "library built for research output" },
] as const;

const categoryIcons = [Microscope, Atom, Dna, FlaskConical, Sparkles, Network] as const;

function getPlanCtaHref(planId: string) {
  if (planId === "FREE") {
    return "/library";
  }

  return `/sign-in?redirect_url=${encodeURIComponent(`/checkout?plan=${planId}`)}`;
}

export default async function MarketingHomePage() {
  const [categories, featuredAssets, plans] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: "asc" },
      take: 6,
      include: { _count: { select: { assets: true } } },
    }),
    prisma.asset.findMany({
      where: { deletedAt: null, isPublished: true },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { category: { select: { name: true, slug: true } } },
    }),
    getRuntimePlans(),
  ]);

  return (
    <main>
      <section className="px-4 py-28 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
        <div className="rounded-[var(--radius-lg)] border bg-card p-8 sm:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Imagiene Asset Library
          </p>
          <h1 className="mt-6 max-w-4xl text-4xl font-semibold tracking-tight sm:text-6xl">
            Scientific illustration assets for research scholars.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            Browse publication-ready icons, diagrams, vectors, PNGs, and SVGs
            with access controls for free, pro, and premium collections.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/library"
              className="rounded-[var(--radius-md)] bg-primary px-6 py-3 text-center text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Browse Library
            </Link>
            <Link
              href="#pricing"
              className="rounded-[var(--radius-md)] border px-6 py-3 text-center text-sm font-semibold transition-colors hover:bg-muted"
            >
              View Pricing
            </Link>
          </div>
        </div>
        <div className="grid gap-4 rounded-[var(--radius-lg)] border bg-card p-6">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-[var(--radius-md)] border bg-muted/35 p-5">
              <p className="text-3xl font-semibold">{stat.value}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
        </div>
      </section>

      <section className="bg-muted/35 px-4 py-28 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Featured Categories</h2>
            <p className="mt-3 text-sm text-muted-foreground">Explore curated collections built for scientific communication.</p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category, index) => {
              const Icon = categoryIcons[index % categoryIcons.length];

              return (
                <Link key={category.id} href={`/library/category/${category.slug}`} className="rounded-[var(--radius-lg)] border bg-card p-6 shadow-sm transition-colors hover:border-primary/40">
                  <span className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-primary/10 text-primary dark:bg-primary/20 dark:text-cyan-100">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-semibold">{category.name}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {category.description ?? `${category._count.assets} publication-ready assets.`}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 py-28 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Featured Assets</h2>
              <p className="mt-3 text-sm text-muted-foreground">Publication-ready visuals across every discipline.</p>
            </div>
            <Link href="/library" className="inline-flex items-center justify-center rounded-[var(--radius-md)] border px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted">
              View all
            </Link>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featuredAssets.map((asset) => (
              <Link key={asset.id} href={`/library/${asset.id}`} className="group overflow-hidden rounded-[var(--radius-lg)] border bg-card p-2 shadow-sm transition-colors hover:border-primary/40">
                <div className="relative overflow-hidden rounded-[var(--radius-md)] bg-muted">
                  <span className="absolute left-2 top-2 z-10 rounded-[var(--radius-full)] bg-background px-2.5 py-1 text-[11px] font-semibold text-foreground shadow-sm">
                    {asset.accessLevel.toLowerCase()}
                  </span>
                  <div
                    className="aspect-[4/3] bg-muted bg-cover bg-center"
                    style={{ backgroundImage: `url(${getProtectedAssetPreviewUrl(asset.id)})` }}
                    aria-label={asset.title}
                  />
                </div>
                <div className="px-2 pb-3 pt-3">
                  <h3 className="truncate text-sm font-semibold">{asset.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{asset.category.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="scroll-mt-24 bg-muted/35 px-4 py-28 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-muted-foreground">Pricing</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Choose one access level.</h2>
            <p className="mt-3 text-muted-foreground">Start free. Upgrade only when your work needs pro or premium scientific visuals.</p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {plans.map((plan) => (
              <article key={plan.id} className="flex min-h-[360px] flex-col rounded-[var(--radius-lg)] border bg-card p-6 shadow-sm">
                <h3 className="text-2xl font-semibold">{plan.name}</h3>
                <p className="mt-3 text-3xl font-semibold tracking-tight">{plan.displayPrice}</p>
                <p className="mt-4 min-h-16 text-sm leading-6 text-muted-foreground">{plan.description}</p>
                <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                {plan.active ? (
                  <Link href={getPlanCtaHref(plan.id)} className="mt-auto rounded-[var(--radius-md)] bg-primary px-5 py-3 text-center text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
                    {plan.id === "FREE" ? "Start Browsing" : "Sign in to Upgrade"}
                  </Link>
                ) : (
                  <p className="mt-auto rounded-[var(--radius-md)] border bg-muted px-5 py-3 text-center text-sm font-semibold text-muted-foreground">
                    {plan.inactiveMessage}
                  </p>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
