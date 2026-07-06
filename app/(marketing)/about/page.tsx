import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Download,
  FileArchive,
  Gauge,
  ImageIcon,
  Layers3,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About",
  description: "Learn how Imagiene delivers fast, protected, publication-ready scientific images.",
};

const spotlightFeatures = [
  {
    title: "Faster image rendering",
    description:
      "Optimized preview routes keep browsing smooth while large originals stay out of the page markup.",
    icon: Zap,
  },
  {
    title: "Copyright-protected premium images",
    description:
      "Premium visuals are served through access-aware system endpoints, not direct public file URLs.",
    icon: ShieldCheck,
  },
  {
    title: "Compressed and original files",
    description:
      "Users can evaluate lightweight previews first, then download the original asset when their plan allows it.",
    icon: FileArchive,
  },
] as const;

const productFeatures = [
  {
    title: "Signed delivery flow",
    description: "Images stay in protected storage and are streamed only when the app approves the request.",
    icon: LockKeyhole,
  },
  {
    title: "Plan-based access",
    description: "Free, Pro, and Premium collections can be managed without changing the browsing experience.",
    icon: Layers3,
  },
  {
    title: "Scientific asset metadata",
    description: "Formats, dimensions, categories, tags, and access levels make the library easier to trust.",
    icon: ImageIcon,
  },
  {
    title: "Download-first protection",
    description: "Original files are delivered as controlled downloads instead of inspectable direct links.",
    icon: Download,
  },
] as const;

const qualitySignals = [
  "Curated categories and tags for research workflows",
  "Admin publishing controls before assets go live",
  "Responsive browsing across desktop, tablet, and mobile",
  "Light and dark mode friendly interface tokens",
] as const;

export default function AboutPage() {
  return (
    <main className="overflow-hidden">
      <section className="px-4 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-muted-foreground">
              Product focus
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-5xl">
              Built around the image experience, not just asset storage.
            </h2>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {spotlightFeatures.map((feature) => {
              const Icon = feature.icon;

              return (
                <article
                  key={feature.title}
                  className="rounded-[1.75rem] border bg-card p-6 shadow-sm transition-colors hover:border-primary/40 sm:p-8"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-primary/10 text-primary dark:bg-primary/20 dark:text-cyan-100">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-6 text-2xl font-semibold tracking-tight">{feature.title}</h3>
                  <p className="mt-4 leading-7 text-muted-foreground">{feature.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-muted/35 px-4 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div className="rounded-[2rem] border bg-card p-7 shadow-sm sm:p-10">
            <Sparkles className="h-8 w-8 text-primary" />
            <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
              More than a gallery: a controlled product system.
            </h2>
            <p className="mt-4 leading-8 text-muted-foreground">
              The library experience connects browsing speed, access rules, file quality, and download
              protection into one workflow. Free users can discover assets quickly, while paid tiers can
              unlock richer premium originals safely.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {productFeatures.map((feature) => {
              const Icon = feature.icon;

              return (
                <article key={feature.title} className="rounded-[1.5rem] border bg-background p-6 shadow-sm">
                  <Icon className="h-6 w-6 text-primary" />
                  <h3 className="mt-4 font-semibold">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{feature.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1fr_1.15fr]">
          <div className="rounded-[2rem] border bg-card p-7 sm:p-10">
            <Gauge className="h-8 w-8 text-primary" />
            <h2 className="mt-5 text-3xl font-semibold tracking-tight">Designed for real research teams.</h2>
            <p className="mt-4 leading-8 text-muted-foreground">
              Imagiene keeps the front-end simple for users while giving admins the controls needed to
              publish, price, categorize, and protect scientific image assets.
            </p>
          </div>
          <div className="rounded-[2rem] border bg-muted/20 p-5 sm:p-6">
            <div className="grid gap-3 sm:grid-cols-2">
              {qualitySignals.map((signal) => (
                <div key={signal} className="flex gap-3 rounded-[1.25rem] border bg-background p-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <p className="text-sm leading-6 text-muted-foreground">{signal}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] border bg-primary p-8 text-primary-foreground sm:p-10 lg:p-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary-foreground/70">
                Start with the library
              </p>
              <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">
                Browse compressed previews, then unlock protected originals when your work needs them.
              </h2>
            </div>
            <Link
              href="/library"
              className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-primary-foreground px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary-foreground/90"
            >
              Browse assets
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
