import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/admin";
import { UnauthorizedError } from "@/lib/auth";
import type { User } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  let admin: User;

  try {
    admin = await requireAdmin();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      redirect("/sign-in");
    }

    redirect("/dashboard");
  }

  return <AdminShell adminName={admin.name}>{children}</AdminShell>;
}
