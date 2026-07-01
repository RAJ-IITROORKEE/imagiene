export const marketingRoutes = [
  { label: "Home", href: "/" },
  { label: "Library", href: "/library" },
  { label: "Pricing", href: "/#pricing" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

export const dashboardRoutes = [
  { label: "Overview", href: "/dashboard" },
  { label: "Bookmarks", href: "/dashboard/bookmarks" },
  { label: "Downloads", href: "/dashboard/downloads" },
  { label: "Billing", href: "/dashboard/billing" },
  { label: "Settings", href: "/dashboard/settings" },
] as const;

export const adminRoutes = [
  { label: "Overview", href: "/admin/dashboard" },
  { label: "Assets", href: "/admin/assets" },
  { label: "Categories", href: "/admin/categories" },
  { label: "Users", href: "/admin/users" },
  { label: "Subscriptions", href: "/admin/subscriptions" },
  { label: "Payments", href: "/admin/payments" },
  { label: "Messages", href: "/admin/contact-messages" },
  { label: "Settings", href: "/admin/settings" },
] as const;

export const routes = {
  home: "/",
  pricing: "/#pricing",
  signIn: "/sign-in",
  signUp: "/sign-up",
  library: "/library",
  dashboard: "/dashboard",
  checkout: "/checkout",
  admin: "/admin/dashboard",
} as const;
