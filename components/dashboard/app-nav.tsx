"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { AuthActions } from "@/components/shared/auth-actions";
import { SiteLogo } from "@/components/shared/site-logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { dashboardRoutes } from "@/constants/routes";

export function AppNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4 sm:px-10 lg:px-16">
        <SiteLogo />
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Workspace navigation">
          <Link
            href="/library"
            className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            Library
          </Link>
          {dashboardRoutes.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground aria-[current=page]:bg-muted aria-[current=page]:text-foreground"
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <AuthActions compact />
        </div>
      </div>
    </header>
  );
}
