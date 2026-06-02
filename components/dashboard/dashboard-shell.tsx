import type { ReactNode } from "react";

import { AppNav } from "@/components/dashboard/app-nav";

type DashboardShellProps = {
  children: ReactNode;
};

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      {children}
    </div>
  );
}
