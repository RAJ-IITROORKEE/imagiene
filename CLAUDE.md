
# CLAUDE.md — Imagiene Agent Instructions

You are working as a senior full-stack engineer on Imagiene, a SaaS platform for scientific illustration assets. Follow this file strictly while implementing the application.

## 1. Project Mission

Build Phase 1 of Imagiene: a complete scientific asset library SaaS with authentication, admin CRUD, Cloudinary asset management, Razorpay payments, user dashboard, bookmarks, downloads, and plan-based access control.

Do not implement AI Chat, RAG, AI Canvas, Mermaid generation, Excalidraw-style editor, or LLM integration in Phase 1. These are future modules only.

## 2. Tech Stack

Use only this stack unless the user explicitly approves changes:

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Clerk
- MongoDB Atlas
- Prisma ORM
- Razorpay
- Cloudinary
- Upstash Redis
- Zod
- React Hook Form
- Sonner

## 3. Engineering Priorities

Priority order:

1. Correct backend and security.
2. Stable database schema.
3. Functional APIs.
4. Authentication and authorization.
5. Working admin CRUD.
6. Working library search/filter/download flow.
7. Working payment verification.
8. Clean shadcn UI foundation.
9. Responsive layout.
10. Visual polish after functionality.

## 4. Non-Negotiable Rules

- Never expose secrets to the client.
- Never trust client-sent role, plan, price, or payment status.
- All admin APIs must verify admin role server-side.
- All paid asset downloads must be checked server-side.
- Razorpay signature verification must happen server-side.
- Cloudinary signed upload signature must be generated server-side.
- Clerk user must be synced into local `UserProfile`.
- Use Zod validation for all mutation APIs.
- Use Prisma for database access.
- Use server components where possible.
- Use client components only for interactivity.
- Keep code modular and typed.
- Do not add AI modules in Phase 1.

## 5. Development Workflow

For each implementation phase:

1. Read `ARCHITECTURE.md`, `DESIGN.md`, `AGENTS.md`, and this file.
2. Make a small plan.
3. Create or modify files.
4. Keep changes focused.
5. Run checks when possible.
6. Fix TypeScript/lint/build issues.
7. Summarize what was changed and what remains.



Do not create random root-level source folders unless needed.

## 7. Backend Implementation Rules

Use Route Handlers under `src/app/api`.

For every mutation endpoint:

- Authenticate user if needed.
- Authorize admin if needed.
- Validate body with Zod.
- Use Prisma transaction when multiple DB writes must be consistent.
- Return consistent JSON.
- Handle errors gracefully.

Suggested response shape:

```ts
return NextResponse.json({ success: true, data })
return NextResponse.json({ success: false, error: "Message" }, { status: 400 })
```

## 8. Auth Rules

- Use Clerk for authentication.
- Protect app/dashboard/admin routes.
- Use local DB for app-specific role/plan data.
- Admin role must come from local `UserProfile.role` or a safe bootstrap allowlist in env.
- Add Clerk webhook to sync user profile.

## 9. Payment Rules

- Plan price must come from DB/server constants, not client.
- Razorpay order must be created server-side.
- Razorpay payment verification must compare generated HMAC signature with returned signature.
- Store Payment records.
- Update Subscription only after verified payment.
- Add webhook handler even if initial test flow works without it.

## 10. Cloudinary Rules

- Use protected preview image delivery for listings; store preview object keys and render through the preview API instead of permanent public bucket URLs.
- Use gated original file for download.
- Use server-generated signed upload for admin.
- Store public IDs in DB.
- Keep preview and original fields separate.

## 11. UI Rules

- Use shadcn/ui components.
- Use `next-themes` for dark mode.
- Keep UI professional and minimal.
- Add loading, empty, and error states.
- Do not spend excessive effort on animation until functionality is complete.

## 12. Implementation Phases

### Phase 1A — Foundation

- Install dependencies.
- Configure env.
- Configure Clerk provider and middleware/proxy.
- Configure Prisma client.
- Configure theme provider.
- Configure root layout.

### Phase 1B — Database and Seed

- Add Prisma schema.
- Push MongoDB schema.
- Add seed script for plans, categories, and demo assets.
- Add admin bootstrap logic.

### Phase 1C — Auth and Dashboard

- Sign in/sign up pages.
- User sync webhook.
- Dashboard shell.
- User plan card.
- Bookmarks/downloads pages.

### Phase 1D — Asset Library

- Asset list API.
- Asset detail API.
- Library UI.
- Search/filter/sort/pagination.
- Asset detail page.

### Phase 1E — Admin Panel

- Admin guard.
- Admin shell.
- Asset CRUD.
- Category CRUD.
- Tag CRUD.
- Cloudinary signed upload.

### Phase 1F — Bookmarks and Downloads

- Bookmark toggle.
- Download access check.
- Download history.
- Download limits.

### Phase 1G — Payments

- Pricing page.
- Razorpay order creation.
- Razorpay checkout integration.
- Verify endpoint.
- Webhook endpoint.
- Subscription update.

### Phase 1H — Polish and Production

- Error states.
- Empty states.
- Loading skeletons.
- Rate limiting.
- Caching.
- Build fixes.
- Deployment checklist.

## 13. Completion Criteria

Phase 1 is complete only when:

- Signup/signin works.
- User sync works.
- Admin can create and publish assets.
- Library displays assets.
- Search/filter works.
- Bookmark works.
- Free download works.
- Paid download is blocked for free user.
- Razorpay test payment activates plan.
- Pro/Premium asset download works after payment.
- Dashboard shows correct plan/downloads/bookmarks.
- Admin can view users/payments/assets.
- `npm run build` passes.
