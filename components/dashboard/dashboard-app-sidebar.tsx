"use client";

import { UserButton } from "@clerk/nextjs";
import type { PlanType } from "@/lib/generated/prisma";
import { Bookmark, CreditCard, Download, LayoutDashboard, Library, Settings, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { SiteLogo } from "@/components/shared/site-logo";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const dashboardItems = [
  { label: "Library", href: "/library", icon: Library },
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Bookmarks", href: "/dashboard/bookmarks", icon: Bookmark },
  { label: "Downloads", href: "/dashboard/downloads", icon: Download },
  { label: "Billing", href: "/dashboard/billing", icon: CreditCard },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
] as const;

function isActivePath(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

type DashboardAppSidebarProps = {
  plan: PlanType;
};

export function DashboardAppSidebar({ plan }: DashboardAppSidebarProps) {
  const pathname = usePathname();
  const showUpgrade = plan === "FREE";

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip="Imagiene dashboard">
              <SiteLogo href="/dashboard" label="Imagiene" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {dashboardItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActivePath(pathname, item.href);

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.label}
                      isActive={isActive}
                      className={cn(
                        "h-11 rounded-[var(--radius-md)] border border-transparent bg-transparent px-3 font-medium text-sidebar-foreground/75 transition-colors hover:border-sidebar-border hover:bg-sidebar-accent/70 hover:text-sidebar-foreground",
                        isActive && "border-sidebar-primary/25 bg-sidebar-primary/10 text-sidebar-foreground shadow-sm ring-1 ring-sidebar-primary/15 hover:border-sidebar-primary/25 hover:bg-sidebar-primary/15 hover:text-sidebar-foreground",
                      )}
                    >
                      <Link href={item.href}>
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        {showUpgrade ? (
          <div className="rounded-[var(--radius-lg)] border bg-card p-4 shadow-sm group-data-[collapsible=icon]:hidden">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-primary/10 text-primary">
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <p className="font-semibold tracking-tight">Upgrade to Pro</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">Unlock premium assets and higher download access.</p>
              </div>
            </div>
            <Link
              href="/#pricing"
              className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-[var(--radius-md)] bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Upgrade
            </Link>
          </div>
        ) : null}
        <div className="flex items-center justify-between gap-2 rounded-[var(--radius-lg)] border bg-background/70 p-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:border-transparent group-data-[collapsible=icon]:bg-transparent">
          <div className="group-data-[collapsible=icon]:hidden">
            <p className="text-xs font-medium">Account</p>
            <p className="text-[11px] text-muted-foreground">Theme and profile</p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserButton />
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
