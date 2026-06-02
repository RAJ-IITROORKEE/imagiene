import type { Metadata } from "next";
import Link from "next/link";

import { siteConfig } from "@/constants/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact the Imagiene team for scientific asset library support.",
};

export default function ContactPage() {
  return (
    <main className="px-6 py-16 sm:px-10 lg:px-16">
      <section className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_0.85fr]">
        <div className="rounded-3xl border bg-muted/30 p-8 sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Contact
          </p>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
            Need help with access, billing, or asset requests?
          </h1>
          <p className="mt-5 max-w-2xl leading-8 text-muted-foreground">
            Send the Imagiene team a note. Phase 1 keeps support simple while the
            product foundation is being completed.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={`mailto:${siteConfig.supportEmail}`}
              className="rounded-full bg-primary px-6 py-3 text-center text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              Email support
            </a>
            <Link
              href="/pricing"
              className="rounded-full border px-6 py-3 text-center text-sm font-semibold transition hover:bg-background"
            >
              Compare plans
            </Link>
          </div>
        </div>
        <aside className="rounded-3xl border bg-background p-8 sm:p-10">
          <h2 className="text-2xl font-semibold">Support channels</h2>
          <dl className="mt-6 space-y-5 text-sm">
            <div>
              <dt className="font-semibold">Email</dt>
              <dd className="mt-1 text-muted-foreground">{siteConfig.supportEmail}</dd>
            </div>
            <div>
              <dt className="font-semibold">Best for</dt>
              <dd className="mt-1 text-muted-foreground">
                Account access, subscription questions, asset publishing, and
                library feedback.
              </dd>
            </div>
            <div>
              <dt className="font-semibold">Response expectation</dt>
              <dd className="mt-1 text-muted-foreground">
                Support workflow automation will be added after the core SaaS
                flows are stable.
              </dd>
            </div>
          </dl>
        </aside>
      </section>
    </main>
  );
}
