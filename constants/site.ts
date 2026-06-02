export const siteConfig = {
  name: "Imagiene",
  description:
    "A scientific illustration asset library platform for research scholars.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  supportEmail: "support@imagiene.com",
  links: {
    home: "/",
    library: "/library",
    pricing: "/pricing",
    dashboard: "/dashboard",
    admin: "/admin",
  },
} as const;
