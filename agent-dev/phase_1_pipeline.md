# Imagiene Phase 1 Pipeline Plan

## Phase 1A — Foundation

Deliverables:

- Next.js App Router setup.
- Tailwind + shadcn/ui setup.
- Theme provider.
- Clerk provider.
- Clerk middleware/proxy.
- Prisma client singleton.
- Basic route groups.

Acceptance:

- App runs locally.
- Sign in/sign up pages load.
- Protected dashboard redirects correctly.

## Phase 1B — Database and Seed

Deliverables:

- Prisma schema.
- Plans seed: Free, Pro, Premium.
- Starter categories: Biology, Microbiology, Virology, Chemistry, Materials Science, Physics, Lab Equipment, Data/Charts.
- Starter tags.
- Optional demo assets.

Acceptance:

- `npx prisma db push` works.
- Seed script inserts data.

## Phase 1C — Auth and User Sync

Deliverables:

- Clerk webhook.
- `UserProfile` creation/update.
- Admin bootstrap from `ADMIN_EMAILS`.
- Auth helpers.
- Admin helpers.

Acceptance:

- New Clerk user appears in MongoDB.
- Admin email gets ADMIN role.

## Phase 1D — Asset Library APIs

Deliverables:

- Asset listing API.
- Asset detail API.
- Search/filter/sort/pagination.
- Redis cache for common listing queries.

Acceptance:

- Library data returns correctly.
- Search and filters work.

## Phase 1E — Library Frontend

Deliverables:

- Library page.
- Asset grid.
- Asset card.
- Filters.
- Asset detail page.
- Access badges.

Acceptance:

- Public users can browse.
- Signed-in users can open asset details.

## Phase 1F — Admin Panel

Deliverables:

- Admin layout/sidebar.
- Asset table.
- Asset form.
- Category CRUD.
- Tag CRUD.
- Cloudinary signed upload route.

Acceptance:

- Admin can create/publish assets.
- Non-admin cannot access admin APIs/pages.

## Phase 1G — Bookmarks and Downloads

Deliverables:

- Bookmark toggle API.
- Bookmark UI.
- Download authorization utility.
- Download endpoint.
- Download history.
- Monthly limit logic.

Acceptance:

- Free users download free assets only.
- Paid assets require correct plan.
- Downloads are recorded.

## Phase 1H — Payments and Billing

Deliverables:

- Pricing cards.
- Razorpay order API.
- Razorpay verify API.
- Razorpay webhook.
- Subscription update.
- Dashboard billing page.

Acceptance:

- Test payment activates Pro/Premium plan.
- Dashboard reflects plan.
- Paid assets become downloadable.

## Phase 1I — Production Hardening

Deliverables:

- Rate limits.
- Error handling.
- Loading states.
- Empty states.
- Admin audit logs.
- Build/lint fixes.
- Deployment checklist.

Acceptance:

- `npm run lint` passes.
- `npm run build` passes.
- Vercel deployment succeeds.
