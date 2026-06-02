"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import {
  getAdminApiErrorMessage,
  parseAdminApiResponse,
} from "@/components/admin/admin-form-response";
import { PLAN_TYPES } from "@/constants/plans";
import type { AdminUserDetail } from "@/lib/admin-data";

type AdminUserFormProps = {
  user: AdminUserDetail;
};

export function AdminUserForm({ user }: AdminUserFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(formData: FormData) {
    setError(null);
    const payload = {
      role: String(formData.get("role") ?? user.role),
      plan: String(formData.get("plan") ?? user.plan),
      isActive: formData.get("isActive") === "on",
    };

    startTransition(async () => {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await parseAdminApiResponse(response);

      if (!response.ok) {
        const message = getAdminApiErrorMessage(result, "User could not be updated.");
        setError(message);
        toast.error(message);
        return;
      }

      toast.success("User updated");
      router.refresh();
    });
  }

  return (
    <form action={onSubmit} className="rounded-3xl border bg-background p-6 shadow-sm">
      <h2 className="text-xl font-semibold">Account controls</h2>
      <p className="mt-2 text-sm text-muted-foreground">Email and identity remain managed by Clerk. Admin changes here control app role, plan, and active state.</p>
      {error ? <p className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300">{error}</p> : null}
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium">
          Role
          <select name="role" defaultValue={user.role} className="rounded-2xl border bg-background px-4 py-3 font-normal outline-none focus:border-foreground">
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Plan
          <select name="plan" defaultValue={user.plan} className="rounded-2xl border bg-background px-4 py-3 font-normal outline-none focus:border-foreground">
            {PLAN_TYPES.map((plan) => <option key={plan} value={plan}>{plan}</option>)}
          </select>
        </label>
      </div>
      <label className="mt-5 flex items-center gap-3 text-sm font-medium">
        <input name="isActive" type="checkbox" defaultChecked={user.isActive} className="size-4" />
        Active user
      </label>
      <button disabled={isPending} className="mt-6 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-background transition hover:opacity-90 disabled:opacity-60">
        {isPending ? "Saving..." : "Save user"}
      </button>
    </form>
  );
}
