import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/checkout(.*)",
  "/dashboard(.*)",
  "/api/admin(.*)",
  "/api/payments/create-order(.*)",
  "/api/user(.*)",
]);

const isAdminLoginRoute = createRouteMatcher(["/admin/login(.*)"]);

export const proxy = clerkMiddleware(async (auth, request) => {
  if (isProtectedRoute(request) && !isAdminLoginRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
