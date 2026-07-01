import type { CSSProperties, ReactNode } from "react";

import { AdminAppSidebar } from "@/components/admin/admin-app-sidebar";
import { AdminSiteHeader } from "@/components/admin/admin-site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

type AdminShellProps = {
  children: ReactNode;
  adminName?: string | null;
  adminEmail?: string | null;
};

export function AdminShell({ children, adminName, adminEmail }: AdminShellProps) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "18rem",
          "--sidebar-width-icon": "3.25rem",
        } as CSSProperties
      }
    >
      <AdminAppSidebar adminName={adminName} adminEmail={adminEmail} />
      <SidebarInset>
        <AdminSiteHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
