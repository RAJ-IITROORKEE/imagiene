"use client";

import { usePathname } from "next/navigation";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

function titleFromPath(pathname: string) {
  if (pathname === "/admin" || pathname === "/admin/dashboard") {
    return "Overview";
  }

  const segment = pathname.split("/").filter(Boolean).at(-1) ?? "admin";

  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function AdminSiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b bg-background/90 px-4 backdrop-blur sm:px-6">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-4" />
      <div>
        <p className="text-sm font-semibold leading-none">{titleFromPath(pathname)}</p>
        <p className="mt-1 hidden text-xs text-muted-foreground sm:block">Admin operations workspace</p>
      </div>
    </header>
  );
}
