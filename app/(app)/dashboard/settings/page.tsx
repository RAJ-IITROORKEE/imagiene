import type { Metadata } from "next";

import { SettingsForm } from "@/components/dashboard/settings-form";
import { getDashboardSettingsData } from "@/lib/dashboard-data";

export const metadata: Metadata = {
  title: "Settings",
  description: "Update your Imagiene profile settings.",
};

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { user } = await getDashboardSettingsData();

  return (
    <main className="px-6 py-10 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-5xl space-y-8">
        <section className="rounded-[2rem] border bg-muted/20 p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">Settings</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">Profile settings</h1>
          <p className="mt-3 text-muted-foreground">
            Update your public profile details, replace your profile photo, and confirm the plan attached to your account.
          </p>
        </section>
        <SettingsForm name={user.name ?? ""} imageUrl={user.imageUrl ?? ""} email={user.email} plan={user.plan} />
      </div>
    </main>
  );
}
