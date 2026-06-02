"use client";

import { FormEvent, useState, useTransition } from "react";
import { toast } from "sonner";

type SettingsFormProps = {
  name: string;
  imageUrl: string;
  email: string;
};

type ProfileResponse = {
  data?: {
    name: string | null;
    imageUrl: string | null;
  };
  error?: {
    message?: string;
  };
};

export function SettingsForm({ name, imageUrl, email }: SettingsFormProps) {
  const [isPending, startTransition] = useTransition();
  const [formState, setFormState] = useState({ name, imageUrl });

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });
      const payload = (await response.json()) as ProfileResponse;

      if (!response.ok) {
        toast.error(payload.error?.message ?? "Could not update profile");
        return;
      }

      setFormState({
        name: payload.data?.name ?? "",
        imageUrl: payload.data?.imageUrl ?? "",
      });
      toast.success("Profile updated");
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 rounded-3xl border bg-background p-6 shadow-sm">
      <div>
        <label htmlFor="email" className="text-sm font-semibold">Email</label>
        <input
          id="email"
          value={email}
          disabled
          className="mt-2 w-full rounded-2xl border bg-muted px-4 py-3 text-sm text-muted-foreground"
        />
        <p className="mt-2 text-xs text-muted-foreground">Email changes are managed in Clerk.</p>
      </div>
      <div>
        <label htmlFor="name" className="text-sm font-semibold">Display name</label>
        <input
          id="name"
          value={formState.name}
          onChange={(event) => setFormState((current) => ({ ...current, name: event.target.value }))}
          placeholder="Dr. Ada Researcher"
          className="mt-2 w-full rounded-2xl border bg-background px-4 py-3 text-sm outline-none transition focus:border-foreground"
        />
      </div>
      <div>
        <label htmlFor="imageUrl" className="text-sm font-semibold">Avatar URL</label>
        <input
          id="imageUrl"
          value={formState.imageUrl}
          onChange={(event) => setFormState((current) => ({ ...current, imageUrl: event.target.value }))}
          placeholder="https://..."
          className="mt-2 w-full rounded-2xl border bg-background px-4 py-3 text-sm outline-none transition focus:border-foreground"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Saving..." : "Save profile"}
      </button>
    </form>
  );
}
