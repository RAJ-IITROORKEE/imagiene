"use client";

import { Send } from "lucide-react";
import { useState, useTransition } from "react";

type ContactFormState = {
  status: "idle" | "success" | "error";
  message: string;
};

type ApiResponse = {
  message?: string;
  error?: { message?: string; details?: { fieldErrors?: Record<string, string[]> } };
};

function firstFieldError(response: ApiResponse) {
  const fieldErrors = response.error?.details?.fieldErrors;

  if (!fieldErrors) {
    return null;
  }

  const [field, messages] = Object.entries(fieldErrors)[0] ?? [];
  const message = messages?.[0];

  return field && message ? `${field}: ${message}` : null;
}

export function ContactForm() {
  const [state, setState] = useState<ContactFormState>({ status: "idle", message: "" });
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="rounded-[var(--radius-lg)] border bg-card p-5 shadow-sm sm:p-7"
      onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);

        startTransition(async () => {
          setState({ status: "idle", message: "" });
          const response = await fetch("/api/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: formData.get("name"),
              email: formData.get("email"),
              subject: formData.get("subject"),
              message: formData.get("message"),
            }),
          });
          const payload = (await response.json()) as ApiResponse;

          if (!response.ok) {
            setState({
              status: "error",
              message: firstFieldError(payload) ?? payload.error?.message ?? "Could not send your message.",
            });
            return;
          }

          form.reset();
          setState({ status: "success", message: "Message sent. The Imagiene team will review it from the admin inbox." });
        });
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold">
          Name
          <input
            name="name"
            required
            minLength={2}
            maxLength={120}
            placeholder="Your name"
            className="h-12 rounded-[var(--radius-md)] border bg-background px-4 text-sm font-normal outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/25"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold">
          Email
          <input
            name="email"
            required
            type="email"
            maxLength={180}
            placeholder="you@example.com"
            className="h-12 rounded-[var(--radius-md)] border bg-background px-4 text-sm font-normal outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/25"
          />
        </label>
      </div>
      <label className="mt-4 grid gap-2 text-sm font-semibold">
        Subject
        <input
          name="subject"
          required
          minLength={4}
          maxLength={160}
          placeholder="Billing, asset request, account access..."
          className="h-12 rounded-[var(--radius-md)] border bg-background px-4 text-sm font-normal outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/25"
        />
      </label>
      <label className="mt-4 grid gap-2 text-sm font-semibold">
        Message
        <textarea
          name="message"
          required
          minLength={12}
          maxLength={4000}
          rows={7}
          placeholder="Tell us what you need help with. Include plan, asset, or account details if relevant."
          className="resize-none rounded-[var(--radius-md)] border bg-background px-4 py-3 text-sm font-normal leading-6 outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/25"
        />
      </label>
      {state.message ? (
        <p
          className={`mt-4 rounded-[var(--radius-md)] border px-4 py-3 text-sm ${
            state.status === "success"
              ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              : "border-destructive/25 bg-destructive/10 text-destructive"
          }`}
        >
          {state.message}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={isPending}
        className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Send className="h-4 w-4" />
        {isPending ? "Sending..." : "Send message"}
      </button>
    </form>
  );
}
