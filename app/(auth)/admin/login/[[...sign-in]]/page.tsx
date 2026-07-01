import { SignIn } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getSafeAuthRedirect, type AuthRedirectSearchParams } from "@/lib/auth-redirect";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Login",
  description: "Sign in to access the Imagiene admin workspace.",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<AuthRedirectSearchParams>;
}) {
  const params = await searchParams;
  const redirectUrl = getSafeAuthRedirect(params, "/admin/dashboard");
  const { userId } = await auth();

  if (userId) {
    redirect(redirectUrl);
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-6 rounded-[var(--radius-lg)] border bg-card p-5 text-center shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Admin access</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Imagiene operations login</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Sign in with an admin account to manage assets, users, payments, and support messages.
        </p>
      </div>
      <SignIn
        fallbackRedirectUrl={redirectUrl}
        forceRedirectUrl={redirectUrl}
        path="/admin/login"
        routing="path"
        signUpUrl={`/sign-up?redirect_url=${encodeURIComponent(redirectUrl)}`}
      />
    </div>
  );
}
