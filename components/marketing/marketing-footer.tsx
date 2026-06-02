import Link from "next/link";

import { SiteLogo } from "@/components/shared/site-logo";
import { siteConfig } from "@/constants/site";

export function MarketingFooter() {
  return (
    <footer className="border-t bg-muted/20">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 text-sm text-muted-foreground sm:px-10 md:grid-cols-[1.5fr_1fr_1fr] lg:px-16">
        <div className="space-y-3">
          <SiteLogo />
          <p className="max-w-md leading-6">{siteConfig.description}</p>
        </div>
        <div className="space-y-3">
          <p className="font-semibold text-foreground">Product</p>
          <Link href="/library" className="block hover:text-foreground">
            Asset library
          </Link>
          <Link href="/pricing" className="block hover:text-foreground">
            Pricing
          </Link>
          <Link href="/about" className="block hover:text-foreground">
            About
          </Link>
        </div>
        <div className="space-y-3">
          <p className="font-semibold text-foreground">Support</p>
          <Link href="/contact" className="block hover:text-foreground">
            Contact
          </Link>
          <a href={`mailto:${siteConfig.supportEmail}`} className="block hover:text-foreground">
            {siteConfig.supportEmail}
          </a>
          <Link href="/dashboard" className="block hover:text-foreground">
            Dashboard
          </Link>
        </div>
      </div>
    </footer>
  );
}
