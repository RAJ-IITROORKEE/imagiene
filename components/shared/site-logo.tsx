import Link from "next/link";
import Image from "next/image";

import { siteConfig } from "@/constants/site";

type SiteLogoProps = {
  href?: string;
  label?: string;
};

export function SiteLogo({ href = "/", label = siteConfig.name }: SiteLogoProps) {
  return (
    <Link href={href} className="flex items-center gap-3 font-semibold tracking-tight">
      <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl border bg-background shadow-sm">
        <Image
          src="/logo.png"
          alt=""
          width={40}
          height={40}
          className="h-full w-full object-cover"
          priority
        />
      </span>
      <span>{label}</span>
    </Link>
  );
}
