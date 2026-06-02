# Imagiene Phase 1 Implementation Plan

Imagiene is a scientific illustration asset library SaaS. Phase 1 builds the working asset library foundation only: authentication, admin panel, asset CRUD, subscriptions, Razorpay payments, user dashboard, bookmarks, downloads, access control, and service integrations.

AI Chat and AI Canvas are out of scope for Phase 1. Only clean placeholders/routes may be added later if needed.

## Global Rules

- Use Next.js 16 App Router with root-level `app/` and no `src/` directory.
- Use route groups: `app/(marketing)`, `app/(auth)`, `app/(app)`, `app/(admin)`.
- Admin URLs must live under `app/(admin)/admin/` and resolve to `/admin` paths.
- Build backend functionality before heavy UI polish.
- Keep APIs protected, validated with Zod, and typed.
- Use MongoDB through Prisma ORM.
- Use Clerk for authentication and user sync.
- Use Razorpay for payments and subscription activation.
- Use Cloudinary for asset upload/storage helpers.
- Use Upstash Redis for caching and rate limiting.
- Use shadcn-style UI foundations, Tailwind CSS, Sonner, Lucide icons, and dark/light theme support.
- After each major phase, run checks, fix failures, summarize work, and commit when git is available.

## Required Check Sequence

Run before each phase commit:

```bash
npm run lint
npm run build
npx prisma generate
```

For Prisma schema phases, also run:

```bash
npx prisma db push
```

## Current Environment Notes

- Current project uses root-level `app/`.
- No `src/` directory should be created.
- This workspace is currently not a git repository, so commits are blocked until git is initialized.
- Next.js 16 docs in `node_modules/next/dist/docs/` deprecate `middleware.ts` in favor of `proxy.ts`; Clerk protection will be implemented in the Next 16-compatible root proxy file unless build compatibility requires otherwise.
- Local Node is `v20.13.1`; Prisma was pinned to the 6.x line because Prisma 7 requires Node `20.19+`.

## Phase 1.1 - Project Foundation

- Confirm root-level `app/` and no `src/`.
- Create route groups: `app/(marketing)`, `app/(auth)`, `app/(app)`, `app/(admin)`.
- Create base folders: `components/marketing`, `components/auth`, `components/library`, `components/dashboard`, `components/admin`, `components/checkout`, `components/shared`, `components/providers`, `components/ui`, `constants`, `hooks`, `lib`, `lib/db`, `lib/validators`, `types`, `prisma`.
- Configure root layout metadata, theme, Clerk provider, and global styling.
- Configure Clerk request protection through Next 16 proxy/middleware integration.
- Create basic pages for `/`, `/pricing`, `/sign-in`, `/sign-up`, `/library`, `/dashboard`, `/admin`.
- Run lint, build, Prisma generate if schema exists, then commit: `phase 1.1: setup app foundation and route groups`.

## Phase 1.2 - Constants, Types, Utilities

- Create `constants/site.ts`, `constants/routes.ts`, `constants/plans.ts`, `constants/asset-types.ts`.
- Create `lib/utils.ts`, `lib/slug.ts`.
- Create `types/asset.ts`, `types/user.ts`, `types/subscription.ts`, `types/index.ts`.
- Add plans: Free, Pro at Rs.1499/month, Premium at Rs.2999/month.
- Add access levels: `FREE`, `PRO`, `PREMIUM`.
- Add asset types: `ICON`, `ILLUSTRATION`, `DIAGRAM`, `VECTOR`, `PNG`, `SVG`.
- Run checks and commit: `phase 1.2: add constants types and utility foundation`.

## Phase 1.3 - Prisma MongoDB Schema

- Create full Prisma MongoDB schema.
- Models: `User`, `Asset`, `Category`, `Tag`, `Bookmark`, `Download`, `Subscription`, `Payment`, `AdminAuditLog`.
- Enums: `UserRole`, `PlanType`, `AssetType`, `AssetAccessLevel`, `SubscriptionStatus`, `PaymentStatus`.
- Include unique constraints, relations, timestamps, and MongoDB object ID mappings.
- Run `npx prisma generate` and `npx prisma db push`.
- Run checks and commit: `phase 1.3: add prisma mongodb schema`.

## Phase 1.4 - Core Backend Libraries

- Create `lib/prisma.ts`, `lib/auth.ts`, `lib/admin.ts`, `lib/permissions.ts`, `lib/asset-access.ts`, `lib/cloudinary.ts`, `lib/razorpay.ts`, `lib/redis.ts`, `lib/rate-limit.ts`.
- Implement Prisma singleton, Clerk user helper, DB user sync helper, admin guard, plan-based asset access, Razorpay instance, Cloudinary signed upload helper, Redis client, and rate limiter helper.
- Run checks and commit: `phase 1.4: add backend service helpers`.

## Phase 1.5 - Validators

- Create Zod validators for assets, categories, payments, and users.
- Include create/update asset, asset query filters, create/update category, Razorpay order, payment verification, and safe profile update schemas.
- Run checks and commit: `phase 1.5: add zod validators`.

## Phase 1.6 - Public Asset Library APIs

- Create APIs: `/api/assets`, `/api/assets/[assetId]`, `/api/assets/[assetId]/download`, `/api/assets/[assetId]/bookmark`, `/api/categories`, `/api/tags`, `/api/search`.
- Support pagination, search, filters, published-only reads, auth-required bookmark/download, asset access enforcement, download logging, and proper status codes.
- Run checks and commit: `phase 1.6: add public asset library APIs`.

## Phase 1.7 - User Dashboard APIs

- Create APIs: `/api/user/profile`, `/api/user/bookmarks`, `/api/user/downloads`.
- Require auth, return current profile/bookmarks/downloads, allow safe profile update, and block frontend role/plan changes.
- Run checks and commit: `phase 1.7: add user dashboard APIs`.

## Phase 1.8 - Clerk Webhook

- Create `/api/webhooks/clerk`.
- Verify Svix signatures with `CLERK_WEBHOOK_SECRET`.
- Handle `user.created`, `user.updated`, and `user.deleted` safely.
- Run checks and commit: `phase 1.8: add clerk user sync webhook`.

## Phase 1.9 - Razorpay Payment APIs

- Create `/api/payments/create-order`, `/api/payments/verify`, `/api/payments/webhook`.
- Use server-side pricing only, verify signatures, create payment records, create/update subscriptions, and update user plan after verified payment.
- Verify webhook signatures with `RAZORPAY_WEBHOOK_SECRET`.
- Run checks and commit: `phase 1.9: add razorpay payment and subscription APIs`.

## Phase 1.10 - Admin APIs

- Create admin APIs for assets, categories, users, subscriptions, and analytics.
- Enforce admin-only access.
- Implement asset CRUD, soft delete/publish/unpublish, category CRUD, user/subscription views, analytics, and audit logs.
- Run checks and commit: `phase 1.10: add admin management APIs`.

## Phase 1.11 - Frontend Layouts

- Create layouts for marketing, auth, app, and admin groups.
- Add marketing navbar/footer, centered auth shell, protected user navigation, protected admin navigation, mobile baseline, and admin guard.
- Run checks and commit: `phase 1.11: add marketing app auth and admin layouts`.

## Phase 1.12 - Marketing Pages

- Create home, pricing, about, and contact pages.
- Explain Imagiene, add CTA to `/library`, render Free/Pro/Premium pricing, and route paid CTAs through auth/checkout logic.
- Run checks and commit: `phase 1.12: add marketing and pricing pages`.

## Phase 1.13 - Auth Pages

- Create Clerk catch-all sign-in and sign-up pages.
- Match theme and redirect authenticated users appropriately.
- Run checks and commit: `phase 1.13: add clerk authentication pages`.

## Phase 1.14 - Asset Library Frontend

- Create library pages, category page, detail page, and library components.
- Support browse, search, filters, asset detail, bookmarks, downloads, upgrade prompt, loading states, empty states, and shadcn-style components.
- Run checks and commit: `phase 1.14: add asset library frontend`.

## Phase 1.15 - User Dashboard Frontend

- Create dashboard, bookmarks, downloads, billing, and settings pages.
- Add overview, plan card, bookmark list, download list, billing panel, and settings form.
- Run checks and commit: `phase 1.15: add user dashboard frontend`.

## Phase 1.16 - Checkout Frontend

- Create checkout and success pages.
- Add checkout card, Razorpay button, payment verification flow, success state, and failure handling.
- Run checks and commit: `phase 1.16: add checkout and payment frontend`.

## Phase 1.17 - Admin Frontend

- Create admin pages for dashboard, assets, new asset, edit asset, categories, users, subscriptions, payments, and settings.
- Add admin sidebar/header/stats/tables/forms.
- Support Cloudinary upload/select path for assets.
- Run checks and commit: `phase 1.17: add admin dashboard frontend`.

## Phase 1.18 - Seed Script and Demo Data

- Add seed script for categories, tags, and sample placeholder assets.
- Add `npm run db:seed` command.
- Run checks and commit: `phase 1.18: add database seed script`.

## Phase 1.19 - Security, Access Control, and Rate Limiting

- Re-audit and enforce protection for user APIs, admin APIs, paid downloads, frontend plan changes, admin routes, webhook signatures, and env usage.
- Add rate limits to search, downloads, payment order creation, and admin mutation APIs.
- Run checks and commit: `phase 1.19: secure api routes and access control`.

## Phase 1.20 - Final Testing and Stabilization

- Run `npx prisma generate`, `npx prisma db push`, `npm run lint`, and `npm run build`.
- Execute manual checklist for home, auth, DB sync, library, search, filters, details, bookmarks, downloads, paid access blocks, checkout, plan update, dashboard, and admin workflows.
- Final commit: `phase 1: complete functional asset library saas foundation`.

## Final Delivery

- Final summary.
- Implemented routes.
- Implemented APIs.
- Required environment variables.
- Manual testing guide.
- Remaining TODOs.
- Vercel deployment notes.
