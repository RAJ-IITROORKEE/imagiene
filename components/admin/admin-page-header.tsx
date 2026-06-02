import Link from "next/link";
import type { ReactNode } from "react";

type AdminPageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  action?: {
    href: string;
    label: string;
  };
  children?: ReactNode;
};

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  action,
  children,
}: AdminPageHeaderProps) {
  return (
    <section className="rounded-3xl border bg-muted/30 p-6 sm:p-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-muted-foreground">
            {eyebrow}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
          <p className="mt-3 max-w-3xl text-muted-foreground">{description}</p>
        </div>
        {action ? (
          <Link
            href={action.href}
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-background transition hover:opacity-90"
          >
            {action.label}
          </Link>
        ) : null}
      </div>
      {children ? <div className="mt-6">{children}</div> : null}
    </section>
  );
}
