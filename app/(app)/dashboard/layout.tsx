import type { CSSProperties, ReactNode } from "react";

import { DashboardAppSidebar } from "@/components/dashboard/dashboard-app-sidebar";
import { DashboardSiteHeader } from "@/components/dashboard/dashboard-site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { requireDashboardUser } from "@/lib/dashboard-data";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await requireDashboardUser();

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "17rem",
          "--sidebar-width-icon": "3.25rem",
        } as CSSProperties
      }
    >
      <DashboardAppSidebar plan={user.plan} />
      <SidebarInset>
        <DashboardSiteHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
