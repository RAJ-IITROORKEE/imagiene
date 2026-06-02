import type { ReactNode } from "react";
import { UserButton } from "@clerk/nextjs";

import { AdminNav } from "@/components/admin/admin-nav";

type AdminShellProps = {
  children: ReactNode;
  adminName?: string | null;
};

export function AdminShell({ children, adminName }: AdminShellProps) {
  return (
    <div className="min-h-screen bg-background lg:pl-72">
      <AdminNav />
      <div className="min-h-screen">
        <header className="flex items-center justify-between border-b px-6 py-4 sm:px-10 lg:px-12">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Admin panel</p>
            <p className="text-lg font-semibold">{adminName ?? "Imagiene administrator"}</p>
          </div>
          <UserButton />
        </header>
        {children}
      </div>
    </div>
  );
}
