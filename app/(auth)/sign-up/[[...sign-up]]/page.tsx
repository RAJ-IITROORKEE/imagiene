import { SignUp } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { authUrl, getSafeAuthRedirect, type AuthRedirectSearchParams } from "@/lib/auth-redirect";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create your Imagiene account.",
};

export default async function SignUpPage({
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
      <SignUp
        fallbackRedirectUrl={redirectUrl}
        forceRedirectUrl={redirectUrl}
        path="/sign-up"
        routing="path"
        signInUrl={authUrl("/sign-in", redirectUrl)}
      />
    </div>
  );
}
