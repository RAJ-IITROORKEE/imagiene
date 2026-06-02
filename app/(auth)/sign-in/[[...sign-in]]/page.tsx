import { SignIn } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { authUrl, getSafeAuthRedirect, type AuthRedirectSearchParams } from "@/lib/auth-redirect";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Imagiene account.",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<AuthRedirectSearchParams>;
}) {
  const params = await searchParams;
  const redirectUrl = getSafeAuthRedirect(params);
  const { userId } = await auth();

  if (userId) {
    redirect(redirectUrl);
  }

  return (
    <div className="w-full max-w-md">
      <SignIn
        fallbackRedirectUrl={redirectUrl}
        forceRedirectUrl={redirectUrl}
        path="/sign-in"
        routing="path"
        signUpUrl={authUrl("/sign-up", redirectUrl)}
      />
    </div>
  );
}
