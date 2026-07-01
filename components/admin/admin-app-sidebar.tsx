"use client";

import { UserButton } from "@clerk/nextjs";
import {
  BadgeCheck,
  CircleHelp,
  FolderTree,
  Home,
  ImageIcon,
  LayoutDashboard,
  ReceiptText,
  Settings,
  SlidersHorizontal,
  Users,
} from "lucide-react";
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
import { adminRoutes } from "@/constants/routes";
import { cn } from "@/lib/utils";

const iconMap = {
  "/admin/dashboard": LayoutDashboard,
  "/admin/assets": ImageIcon,
  "/admin/categories": FolderTree,
  "/admin/users": Users,
  "/admin/subscriptions": BadgeCheck,
  "/admin/payments": ReceiptText,
  "/admin/contact-messages": CircleHelp,
  "/admin/settings": Settings,
} as const;

function isActivePath(pathname: string, href: string) {
  if (href === "/admin/dashboard") {
    return pathname === href || pathname === "/admin";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

type AdminAppSidebarProps = {
  adminName?: string | null;
  adminEmail?: string | null;
};

export function AdminAppSidebar({ adminName, adminEmail }: AdminAppSidebarProps) {
  const pathname = usePathname();

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild tooltip="Admin dashboard">
                <SiteLogo href="/admin/dashboard" label="Imagiene Admin" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Operations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2">
              {adminRoutes.map((item) => {
                const Icon = iconMap[item.href] ?? SlidersHorizontal;
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
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="View site"
              className="h-10 rounded-[var(--radius-md)] border border-transparent bg-transparent px-3 text-sidebar-foreground/75 hover:border-sidebar-border hover:bg-sidebar-accent/70 hover:text-sidebar-foreground"
            >
              <Link href="/">
                <Home className="h-4 w-4" />
                <span>View site</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="flex items-center justify-between gap-2 rounded-[var(--radius-lg)] border bg-background/70 p-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:border-transparent group-data-[collapsible=icon]:bg-transparent">
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-xs font-medium">{adminName ?? "Admin"}</p>
            <p className="truncate text-[11px] text-muted-foreground">{adminEmail ?? "Protected workspace"}</p>
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
