import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/admin";
import { UnauthorizedError } from "@/lib/auth";
import type { User } from "@/lib/generated/prisma";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  let admin: User;

  try {
    admin = await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      redirect("/admin/login?redirect_url=/admin/dashboard");
    }

    redirect("/dashboard");
  }

  return <AdminShell adminName={admin.name} adminEmail={admin.email}>{children}</AdminShell>;
}
