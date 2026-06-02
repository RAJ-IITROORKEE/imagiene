"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { SiteLogo } from "@/components/shared/site-logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { adminRoutes } from "@/constants/routes";

export function AdminNav() {
  const pathname = usePathname();

  return (
    <aside className="border-b bg-muted/25 lg:fixed lg:inset-y-0 lg:left-0 lg:w-72 lg:border-b-0 lg:border-r">
      <div className="flex h-full flex-col gap-6 px-6 py-5">
        <div className="flex items-center justify-between gap-3">
          <SiteLogo href="/admin" label="Imagiene Admin" />
          <div className="lg:hidden">
            <ThemeToggle />
          </div>
        </div>
        <nav className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0" aria-label="Admin navigation">
          {adminRoutes.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className="shrink-0 rounded-2xl px-4 py-3 text-sm font-medium text-muted-foreground transition hover:bg-background hover:text-foreground aria-[current=page]:bg-background aria-[current=page]:text-foreground aria-[current=page]:shadow-sm"
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto hidden lg:block">
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
