"use client";

import { usePathname } from "next/navigation";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

const pageTitles: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/bookmarks": "Bookmarks",
  "/dashboard/downloads": "Downloads",
  "/dashboard/billing": "Billing",
  "/dashboard/settings": "Settings",
};

export function DashboardSiteHeader() {
  const pathname = usePathname();
  const title = pageTitles[pathname] ?? "Dashboard";

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b bg-background/90 px-4 backdrop-blur sm:px-6">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-4" />
      <div>
        <p className="text-sm font-semibold leading-none">{title}</p>
        <p className="mt-1 hidden text-xs text-muted-foreground sm:block">Imagiene user workspace</p>
      </div>
    </header>
  );
}
