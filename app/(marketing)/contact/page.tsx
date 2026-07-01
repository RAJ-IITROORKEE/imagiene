import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Mail, MessageSquareText, ShieldCheck } from "lucide-react";

import { ContactForm } from "@/components/marketing/contact-form";
import { siteConfig } from "@/constants/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact the Imagiene team for scientific asset library support.",
};

export default function ContactPage() {
  return (
    <main className="px-6 py-16 sm:px-10 lg:px-16">
      <section className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div className="space-y-6">
          <div className="rounded-[var(--radius-lg)] border bg-card p-8 shadow-sm sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">Contact</p>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
              Reach the Imagiene support team.
            </h1>
            <p className="mt-5 max-w-2xl leading-8 text-muted-foreground">
              Ask about asset licensing, account access, billing, or a specific scientific illustration request. Messages are stored securely for admin review.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={`mailto:${siteConfig.supportEmail}`}
                className="rounded-[var(--radius-md)] bg-primary px-6 py-3 text-center text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Email support
              </a>
              <Link
                href="/#pricing"
                className="rounded-[var(--radius-md)] border bg-background px-6 py-3 text-center text-sm font-semibold transition-colors hover:bg-muted"
              >
                Compare plans
              </Link>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { icon: Mail, label: "Support email", value: siteConfig.supportEmail },
              { icon: Clock, label: "Typical response", value: "Within 1-2 business days" },
              { icon: ShieldCheck, label: "Admin tracked", value: "Every request lands in a protected inbox" },
              { icon: MessageSquareText, label: "Best for", value: "Assets, billing, plans, and feedback" },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.label} className="rounded-[var(--radius-lg)] border bg-background p-5">
                  <Icon className="h-5 w-5 text-primary" />
                  <p className="mt-4 text-sm font-semibold">{item.label}</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.value}</p>
                </div>
              );
            })}
          </div>
        </div>
        <ContactForm />
      </section>
    </main>
  );
}
