import type { ReactNode } from "react";
import Link from "next/link";

import { SiteLogo } from "@/components/shared/site-logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";

type AuthShellProps = {
  children: ReactNode;
};

export function AuthShell({ children }: AuthShellProps) {
  return (
    <main className="grid min-h-screen bg-muted/20 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="hidden border-r bg-background px-10 py-8 lg:flex lg:flex-col lg:justify-between">
        <SiteLogo />
        <div className="max-w-md space-y-5">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Research Visuals
          </p>
          <h1 className="text-4xl font-semibold tracking-tight">
            Keep publication-ready scientific assets in one workspace.
          </h1>
          <p className="leading-7 text-muted-foreground">
            Sign in to bookmark illustrations, track downloads, manage billing,
            and unlock plan-based asset collections.
          </p>
        </div>
        <p className="text-sm text-muted-foreground">Imagiene Phase 1 Asset Library</p>
      </section>
      <section className="flex min-h-screen flex-col">
        <div className="flex items-center justify-between px-6 py-5 lg:justify-end">
          <div className="lg:hidden">
            <SiteLogo />
          </div>
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center px-6 pb-12">
          {children}
        </div>
        <div className="px-6 pb-6 text-center text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Back to home
          </Link>
        </div>
      </section>
    </main>
  );
}
