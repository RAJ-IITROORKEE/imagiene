export type AuthRedirectSearchParams = Record<string, string | string[] | undefined>;

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function getSafeAuthRedirect(
  searchParams: AuthRedirectSearchParams,
  fallback = "/dashboard",
): string {
  const redirectUrl =
    firstParam(searchParams.redirect_url) ??
    firstParam(searchParams.redirectUrl) ??
    firstParam(searchParams.redirect);

  if (!redirectUrl || !redirectUrl.startsWith("/") || redirectUrl.startsWith("//")) {
    return fallback;
  }

  return redirectUrl;
}

export function authUrl(path: "/sign-in" | "/sign-up", redirectUrl: string): string {
  return `${path}?redirect_url=${encodeURIComponent(redirectUrl)}`;
}
