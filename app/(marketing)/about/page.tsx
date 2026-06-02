import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about the Imagiene scientific asset library.",
};

const principles = [
  "Research-first asset organization",
  "Plan-based access without hidden role changes",
  "Admin-managed library quality and publishing controls",
] as const;

export default function AboutPage() {
  return (
    <main className="px-6 py-16 sm:px-10 lg:px-16">
      <section className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border bg-muted/30 p-8 sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            About Imagiene
          </p>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
            A focused asset library for scientific communication.
          </h1>
          <p className="mt-5 leading-8 text-muted-foreground">
            Imagiene helps scholars and research teams keep scientific visuals
            discoverable, reusable, and governed by clear access levels.
          </p>
        </div>
        <div className="grid gap-4">
          {principles.map((principle) => (
            <article key={principle} className="rounded-3xl border bg-background p-6">
              <h2 className="text-xl font-semibold">{principle}</h2>
              <p className="mt-3 leading-7 text-muted-foreground">
                Phase 1 keeps the product practical: curated assets, bookmarks,
                downloads, admin publishing workflows, and subscription access.
              </p>
            </article>
          ))}
        </div>
      </section>
      <section className="mx-auto mt-8 max-w-7xl rounded-3xl border bg-primary p-8 text-primary-foreground sm:p-10">
        <h2 className="text-3xl font-semibold tracking-tight">Start with the library.</h2>
        <p className="mt-3 max-w-2xl text-primary-foreground/75">
          Browse the available catalog now, then upgrade when your work needs Pro
          or Premium scientific assets.
        </p>
        <Link
          href="/library"
          className="mt-6 inline-flex rounded-full bg-primary-foreground px-6 py-3 text-sm font-semibold text-primary transition hover:opacity-90"
        >
          Browse assets
        </Link>
      </section>
    </main>
  );
}
