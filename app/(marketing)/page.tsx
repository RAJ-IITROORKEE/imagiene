import Link from "next/link";

const stats = [
  { value: "6", label: "asset formats planned for launch" },
  { value: "3", label: "clear access levels for teams" },
  { value: "1", label: "library built for research output" },
] as const;

const workflows = [
  "Find publication-ready diagrams, icons, vectors, PNGs, and SVGs.",
  "Bookmark visuals for ongoing papers, posters, grant decks, and lectures.",
  "Download only what your Free, Pro, or Premium plan unlocks.",
] as const;

export default function MarketingHomePage() {
  return (
    <main className="px-6 py-16 sm:px-10 lg:px-16">
      <section className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-stretch">
        <div className="rounded-3xl border bg-muted/40 p-8 sm:p-12">
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
              className="rounded-full bg-primary px-6 py-3 text-center text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              Browse Library
            </Link>
            <Link
              href="/pricing"
              className="rounded-full border px-6 py-3 text-center text-sm font-semibold transition hover:bg-background"
            >
              View Pricing
            </Link>
          </div>
        </div>
        <div className="grid gap-4 rounded-3xl border bg-background p-6">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border bg-muted/30 p-5">
              <p className="text-3xl font-semibold">{stat.value}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="mx-auto mt-8 grid max-w-7xl gap-4 md:grid-cols-3">
        {workflows.map((workflow, index) => (
          <article key={workflow} className="rounded-3xl border bg-muted/20 p-6">
            <p className="text-sm font-semibold text-muted-foreground">0{index + 1}</p>
            <p className="mt-4 text-lg font-medium leading-7">{workflow}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
