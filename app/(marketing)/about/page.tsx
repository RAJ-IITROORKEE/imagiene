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

const heroStats = [
  { value: "Fast", label: "preview rendering for image-heavy libraries" },
  { value: "Private", label: "premium files protected behind system routes" },
  { value: "2 modes", label: "compressed previews and original downloads" },
] as const;

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

const pipelineSteps = ["Compressed preview", "Access check", "Protected original", "System download"] as const;

const qualitySignals = [
  "Curated categories and tags for research workflows",
  "Admin publishing controls before assets go live",
  "Responsive browsing across desktop, tablet, and mobile",
  "Light and dark mode friendly interface tokens",
] as const;

export default function AboutPage() {
  return (
    <main className="overflow-hidden">
      <section className="relative px-4 py-20 sm:px-8 sm:py-24 lg:px-12">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.14),transparent_34%),radial-gradient(circle_at_bottom_right,hsl(var(--muted)),transparent_32%)]" />
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-stretch">
          <div className="rounded-[2rem] border bg-card/90 p-7 shadow-sm backdrop-blur sm:p-10 lg:p-12">
            <p className="inline-flex rounded-full border bg-muted/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-muted-foreground">
              About Imagiene
            </p>
            <h1 className="mt-7 max-w-4xl text-4xl font-semibold tracking-tight sm:text-6xl">
              Scientific images that load fast, stay protected, and remain publication-ready.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
              Imagiene is built for researchers, educators, and creative teams who need trusted visual
              assets without exposing premium originals through inspectable links or slow browsing flows.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/library"
                className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Browse protected library
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/#pricing"
                className="inline-flex items-center justify-center rounded-[var(--radius-md)] border bg-background px-6 py-3 text-sm font-semibold transition-colors hover:bg-muted"
              >
                Compare access levels
              </Link>
            </div>
            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {heroStats.map((stat) => (
                <div key={stat.label} className="rounded-[1.25rem] border bg-muted/35 p-4">
                  <p className="text-2xl font-semibold tracking-tight">{stat.value}</p>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border bg-background/85 p-4 shadow-sm backdrop-blur sm:p-6">
            <div className="overflow-hidden rounded-[1.5rem] border bg-card">
              <div className="flex items-center justify-between border-b bg-muted/35 px-5 py-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                    Product flow
                  </p>
                  <h2 className="mt-1 font-semibold">Protected image pipeline</h2>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary dark:bg-primary/20 dark:text-cyan-100">
                  No public originals
                </span>
              </div>
              <div className="grid gap-4 p-5">
                <div className="relative aspect-[4/3] overflow-hidden rounded-[1.25rem] border bg-muted">
                  <div className="absolute inset-0 bg-[linear-gradient(135deg,hsl(var(--primary)/0.24),transparent_45%),radial-gradient(circle_at_70%_35%,hsl(var(--foreground)/0.18),transparent_18%)]" />
                  <div className="absolute left-5 top-5 rounded-full border bg-background/85 px-3 py-1 text-xs font-semibold backdrop-blur">
                    Compressed preview
                  </div>
                  <div className="absolute bottom-5 left-5 right-5 rounded-[1rem] border bg-background/88 p-4 shadow-sm backdrop-blur">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold">Microscopy vector pack</p>
                        <p className="mt-1 text-xs text-muted-foreground">PNG, SVG, original source</p>
                      </div>
                      <LockKeyhole className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {pipelineSteps.map((step, index) => (
                    <div key={step} className="rounded-[1rem] border bg-muted/30 p-4">
                      <p className="text-xs font-semibold text-muted-foreground">0{index + 1}</p>
                      <p className="mt-1 text-sm font-semibold">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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
