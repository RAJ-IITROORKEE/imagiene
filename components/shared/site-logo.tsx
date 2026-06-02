import Link from "next/link";

import { siteConfig } from "@/constants/site";

type SiteLogoProps = {
  href?: string;
  label?: string;
};

export function SiteLogo({ href = "/", label = siteConfig.name }: SiteLogoProps) {
  return (
    <Link href={href} className="flex items-center gap-3 font-semibold tracking-tight">
      <span className="flex h-9 w-9 items-center justify-center rounded-2xl border bg-primary text-sm text-primary-foreground">
        Im
      </span>
      <span>{label}</span>
    </Link>
  );
}
