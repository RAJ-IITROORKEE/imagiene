import type { ReactNode } from "react";

import { AppNav } from "@/components/dashboard/app-nav";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      {children}
    </div>
  );
}
