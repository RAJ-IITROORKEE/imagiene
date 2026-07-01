"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { AuthActions } from "@/components/shared/auth-actions";
import { SiteLogo } from "@/components/shared/site-logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { dashboardRoutes } from "@/constants/routes";

function isActivePath(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppNav() {
  const pathname = usePathname();

  if (pathname.startsWith("/dashboard")) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4 sm:px-10 lg:px-16">
        <SiteLogo />
        <nav className="hidden items-center gap-2 lg:flex" aria-label="Workspace navigation">
          <Link
            href="/library"
            aria-current={pathname.startsWith("/library") ? "page" : undefined}
            className="rounded-[var(--radius-md)] border border-transparent px-4 py-2 text-sm font-medium text-muted-foreground transition hover:border-border hover:bg-muted hover:text-foreground aria-[current=page]:border-primary/20 aria-[current=page]:bg-primary/10 aria-[current=page]:text-foreground"
          >
            Library
          </Link>
          {dashboardRoutes.map((item) => {
            const isActive = isActivePath(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className="rounded-[var(--radius-md)] border border-transparent px-4 py-2 text-sm font-medium text-muted-foreground transition hover:border-border hover:bg-muted hover:text-foreground aria-[current=page]:border-primary/20 aria-[current=page]:bg-primary/10 aria-[current=page]:text-foreground"
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
      <nav className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-6 pb-3 sm:px-10 lg:hidden" aria-label="Workspace navigation mobile">
        {[{ label: "Library", href: "/library" }, ...dashboardRoutes].map((item) => {
          const isActive = isActivePath(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className="shrink-0 rounded-[var(--radius-md)] border border-transparent px-3 py-2 text-sm font-medium text-muted-foreground transition hover:border-border hover:bg-muted hover:text-foreground aria-[current=page]:border-primary/20 aria-[current=page]:bg-primary/10 aria-[current=page]:text-foreground"
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
