"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";

type AuthActionsProps = {
  compact?: boolean;
};

export function AuthActions({ compact = false }: AuthActionsProps) {
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded) {
    return <div className="h-10 w-28 rounded-full border bg-muted/40" aria-hidden />;
  }

  return (
    <div className="flex items-center gap-2">
      {!isSignedIn ? (
        <>
          <Link
            href="/sign-in"
            className="rounded-full border px-4 py-2 text-sm font-medium transition hover:bg-muted"
          >
            Sign in
          </Link>
          {!compact ? (
            <Link
              href="/sign-up"
              className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              Create account
            </Link>
          ) : null}
        </>
      ) : (
        <>
          <Link
            href="/dashboard"
            className="hidden rounded-full border px-4 py-2 text-sm font-medium transition hover:bg-muted sm:inline-flex"
          >
            Dashboard
          </Link>
          <UserButton />
        </>
      )}
    </div>
  );
}
