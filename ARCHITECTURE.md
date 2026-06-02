# Imagiene Phase 1 Architecture

## 1. Product Summary

Imagiene is a scientific illustration SaaS for researchers, PhD scholars, students, labs, and scientific creators who need publication-ready scientific icons, diagrams, vectors, and editable visual assets without depending on fully AI-generated images.

The core idea is to provide a trusted scientific asset library where users can search, filter, preview, bookmark, and download icons/illustrations such as viruses, bacteria, cells, molecules, lab equipment, biological systems, material science diagrams, physics concepts, engineering schematics, and research-related visual elements.

## 2. Phase 1 Scope

Phase 1 must build the working SaaS foundation:

- Public marketing homepage.
- Asset library listing with search, sort, filters, pagination, categories, tags, and asset detail pages.
- Clerk authentication for signup, signin, user session, protected routes, and user identity sync.
- User dashboard with account summary, current plan, downloads, bookmarks, quick actions, and plan status.
- Free and paid asset access logic.
- Bookmark/save asset functionality.
- Download tracking and plan-based access control.
- Admin panel for asset CRUD, category CRUD, tag CRUD, user overview, payment overview, and download analytics.
- Cloudinary-backed asset upload and delivery.
- Razorpay payment flow for Pro and Premium plans.
- Upstash Redis for caching, rate limiting, and lightweight counters.
- Production-ready backend Route Handlers and server-side authorization.

## 3. Explicitly Out of Scope for Phase 1

Do not build these modules yet:

- AI Chat / RAG research paper assistant.
- AI Canvas.
- Mermaid/diagram generation agent.
- Excalidraw/Eraser-style editable canvas.
- LLM provider integration.
- Document upload for research papers.
- Vector database / embeddings.

Only create placeholder route cards or disabled navigation entries if needed. The placeholders must clearly say `Coming Soon` and must not include fake functionality.

## 4. Tech Stack

- Framework: Next.js App Router with TypeScript.
- Styling: Tailwind CSS and shadcn/ui.
- Auth: Clerk.
- Database: MongoDB Atlas.
- ORM: Prisma ORM.
- Payments: Razorpay.
- Asset storage and CDN: Cloudinary.
- Cache/rate limit: Upstash Redis.
- Deployment target: Vercel.
- Validation: Zod.
- Forms: React Hook Form with Zod resolver.
- Notifications: Sonner.

## 5. Application Roles

### Guest

- Can view homepage, pricing, public asset previews, and limited asset metadata.
- Cannot download gated assets.
- Cannot bookmark assets.
- Clicking download/bookmark redirects to signin.

### Authenticated Free User

- Can access library.
- Can download free assets.
- Can bookmark assets.
- Can view dashboard.
- Cannot download Pro/Premium gated assets.

### Pro User

- Can access Free and Pro assets.
- Has higher monthly download limit.
- Can access standard commercial/research license terms.

### Premium User

- Can access Free, Pro, and Premium assets.
- Has highest monthly download limit.
- Can access premium collections and advanced formats when available.

### Admin

- Can manage assets, categories, tags, plans, user records, featured assets, and visibility.
- Can upload assets to Cloudinary using signed server-side upload.
- Can see payments, subscriptions, downloads, and audit logs.

## 6. Core User Flows

### 6.1 Asset discovery flow

1. User lands on homepage.
2. User clicks `Explore Library`.
3. Library opens with search, filters, category chips, asset cards, and pagination.
4. User opens asset detail page.
5. User can preview metadata, formats, tags, license, and access level.
6. User clicks download.
7. System checks authentication and plan.
8. If allowed, system records download and returns secure download URL.
9. If not allowed, system redirects to pricing/upgrade.

### 6.2 Bookmark flow

1. User clicks bookmark on asset card/detail.
2. System requires authenticated user.
3. Bookmark is created or removed.
4. Dashboard shows saved assets.

### 6.3 Subscription flow

1. User opens pricing page.
2. User chooses Pro or Premium.
3. Server creates Razorpay order.
4. User completes checkout.
5. Server verifies Razorpay signature.
6. Payment record is created.
7. User subscription is activated/updated.
8. Dashboard reflects current plan.

### 6.4 Admin asset upload flow

1. Admin opens `/admin/assets/new`.
2. Admin enters title, scientific category, tags, access level, license, description, source/provenance, and file metadata.
3. Admin uploads preview and downloadable file to Cloudinary through signed server route.
4. System stores Cloudinary public IDs and derived URLs in MongoDB.
5. Asset can be published as draft, published, archived, or featured.


## 8. Backend API Design

All protected APIs must use server-side authentication and authorization. Never trust client-provided plan, role, price, asset access level, or payment status.

### Public APIs

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/assets` | Paginated asset listing with search/filter/sort |
| GET | `/api/assets/[id]` | Get public asset detail metadata |

### User APIs

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/assets/[id]/bookmark` | Toggle bookmark |
| GET | `/api/assets/[id]/bookmark` | Check bookmark status |
| POST | `/api/assets/[id]/download` | Validate access and create download record |
| GET | `/api/me/downloads` | User download history |
| GET | `/api/me/bookmarks` | User bookmarks |
| GET | `/api/me/subscription` | Current user plan/subscription |

### Admin APIs

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/admin/assets` | Create asset |
| PATCH | `/api/admin/assets/[id]` | Update asset |
| DELETE | `/api/admin/assets/[id]` | Archive/delete asset |
| POST | `/api/admin/categories` | Create category |
| PATCH | `/api/admin/categories/[id]` | Update category |
| POST | `/api/admin/tags` | Create tag |
| GET | `/api/admin/users` | User overview |
| GET | `/api/admin/payments` | Payment overview |
| GET | `/api/admin/analytics` | Downloads, popular assets, plan stats |
| POST | `/api/admin/cloudinary/signature` | Generate signed upload signature |

### Payment APIs

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/payments/razorpay/order` | Create Razorpay order for selected plan |
| POST | `/api/payments/razorpay/verify` | Verify successful checkout signature |
| POST | `/api/webhooks/razorpay` | Process payment/subscription events |

### Clerk Webhook

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/webhooks/clerk` | Sync Clerk user create/update/delete into local MongoDB profile |

## 9. Database Model Draft

Paste this into `prisma/schema.prisma` and refine during implementation.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

enum UserRole {
  USER
  ADMIN
}

enum PlanTier {
  FREE
  PRO
  PREMIUM
}

enum SubscriptionStatus {
  FREE
  ACTIVE
  PAST_DUE
  CANCELLED
  EXPIRED
}

enum AssetAccessLevel {
  FREE
  PRO
  PREMIUM
}

enum AssetStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

enum AssetType {
  ICON
  ILLUSTRATION
  VECTOR
  DIAGRAM
  IMAGE
}

enum AssetFormat {
  SVG
  PNG
  JPG
  PDF
  EPS
  FIGMA
  OTHER
}

enum ProvenanceType {
  HUMAN_DESIGNED
  CURATED_OPEN_LICENSE
  IN_HOUSE_VECTOR
  PARTNER_CONTRIBUTION
}

enum PaymentStatus {
  CREATED
  PAID
  FAILED
  REFUNDED
}

model UserProfile {
  id               String             @id @default(auto()) @map("_id") @db.ObjectId
  clerkUserId      String             @unique
  email            String             @unique
  name             String?
  imageUrl         String?
  role             UserRole           @default(USER)
  planTier         PlanTier           @default(FREE)
  subscriptionId   String?            @db.ObjectId
  createdAt        DateTime           @default(now())
  updatedAt        DateTime           @updatedAt

  subscription     Subscription?      @relation(fields: [subscriptionId], references: [id])
  bookmarks        Bookmark[]
  downloads        Download[]
  payments         Payment[]
  auditLogs        AdminAuditLog[]
}

model Plan {
  id                String          @id @default(auto()) @map("_id") @db.ObjectId
  key               String          @unique
  name              String
  tier              PlanTier        @unique
  priceInPaise      Int
  currency          String          @default("INR")
  billingInterval   String          @default("monthly")
  monthlyDownloads  Int
  description       String?
  features          String[]
  isActive          Boolean         @default(true)
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt

  subscriptions     Subscription[]
}

model Subscription {
  id                     String              @id @default(auto()) @map("_id") @db.ObjectId
  userId                 String              @db.ObjectId
  planId                 String              @db.ObjectId
  tier                   PlanTier
  status                 SubscriptionStatus  @default(ACTIVE)
  razorpayCustomerId     String?
  razorpaySubscriptionId String?
  currentPeriodStart     DateTime?
  currentPeriodEnd       DateTime?
  cancelAtPeriodEnd      Boolean             @default(false)
  createdAt              DateTime             @default(now())
  updatedAt              DateTime             @updatedAt

  user                   UserProfile          @relation(fields: [userId], references: [id])
  plan                   Plan                 @relation(fields: [planId], references: [id])
  payments               Payment[]
}

model Category {
  id          String     @id @default(auto()) @map("_id") @db.ObjectId
  name        String
  slug        String     @unique
  description String?
  icon        String?
  isActive    Boolean    @default(true)
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  assets      Asset[]
}

model Tag {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  name      String
  slug      String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  assets    AssetTag[]
}

model Asset {
  id                    String            @id @default(auto()) @map("_id") @db.ObjectId
  title                 String
  slug                  String            @unique
  description           String?
  type                  AssetType
  status                AssetStatus       @default(DRAFT)
  accessLevel           AssetAccessLevel  @default(FREE)
  categoryId            String            @db.ObjectId
  category              Category          @relation(fields: [categoryId], references: [id])

  previewUrl            String
  previewPublicId       String?
  downloadUrl           String?
  downloadPublicId      String?
  thumbnailUrl          String?
  width                 Int?
  height                Int?
  fileSizeBytes         Int?
  formats               AssetFormat[]

  licenseName           String
  licenseSummary        String?
  authorName            String?
  sourceUrl             String?
  provenanceType        ProvenanceType
  isAiGenerated         Boolean           @default(false)
  isFeatured            Boolean           @default(false)

  searchText            String?
  viewCount             Int               @default(0)
  downloadCount         Int               @default(0)
  createdAt             DateTime          @default(now())
  updatedAt             DateTime          @updatedAt

  tags                  AssetTag[]
  bookmarks             Bookmark[]
  downloads             Download[]
}

model AssetTag {
  id        String  @id @default(auto()) @map("_id") @db.ObjectId
  assetId   String  @db.ObjectId
  tagId     String  @db.ObjectId

  asset     Asset   @relation(fields: [assetId], references: [id])
  tag       Tag     @relation(fields: [tagId], references: [id])

  @@unique([assetId, tagId])
}

model Bookmark {
  id        String      @id @default(auto()) @map("_id") @db.ObjectId
  userId    String      @db.ObjectId
  assetId   String      @db.ObjectId
  createdAt DateTime    @default(now())

  user      UserProfile @relation(fields: [userId], references: [id])
  asset     Asset       @relation(fields: [assetId], references: [id])

  @@unique([userId, assetId])
}

model Download {
  id          String      @id @default(auto()) @map("_id") @db.ObjectId
  userId      String      @db.ObjectId
  assetId     String      @db.ObjectId
  planTier    PlanTier
  ipHash      String?
  userAgent   String?
  createdAt   DateTime    @default(now())

  user        UserProfile @relation(fields: [userId], references: [id])
  asset       Asset       @relation(fields: [assetId], references: [id])
}

model Payment {
  id                String         @id @default(auto()) @map("_id") @db.ObjectId
  userId            String         @db.ObjectId
  subscriptionId    String?        @db.ObjectId
  planTier          PlanTier
  amountInPaise     Int
  currency          String         @default("INR")
  status            PaymentStatus  @default(CREATED)
  razorpayOrderId   String?
  razorpayPaymentId String?
  razorpaySignature String?
  rawPayload        Json?
  createdAt         DateTime       @default(now())
  updatedAt         DateTime       @updatedAt

  user              UserProfile    @relation(fields: [userId], references: [id])
  subscription      Subscription?  @relation(fields: [subscriptionId], references: [id])
}

model AdminAuditLog {
  id          String       @id @default(auto()) @map("_id") @db.ObjectId
  adminUserId String       @db.ObjectId
  action      String
  entityType  String
  entityId    String?
  metadata    Json?
  createdAt   DateTime     @default(now())

  admin       UserProfile  @relation(fields: [adminUserId], references: [id])
}
```

## 10. Access Control Rules

### Asset download authorization

- FREE asset: authenticated users can download.
- PRO asset: only PRO and PREMIUM users can download.
- PREMIUM asset: only PREMIUM users can download.
- Admins can download all assets.
- Anonymous users must be redirected to signin.

### Admin authorization

Use a server helper:

```ts
assertAdmin() -> current Clerk user -> local UserProfile -> role === ADMIN
```

Never rely on frontend-only checks for admin pages or APIs.

## 11. Cloudinary Strategy

Use two delivery levels:

1. Public preview image: optimized, watermarked if needed, safe to show in listing.
2. Original/high-resolution download file: gated through backend access check.

Recommended asset fields:

- `previewPublicId`
- `downloadPublicId`
- `previewUrl`
- `downloadUrl`
- `thumbnailUrl`

Production rule:

- Admin uploads must use signed upload through a server route.
- Never expose `CLOUDINARY_API_SECRET` to the browser.
- Paid original files should not be exposed directly on public cards.

## 12. Razorpay Strategy

Phase 1 can start with checkout order-based plan activation:

- Pro: ₹1499/month stored as `149900` paise.
- Premium: ₹2999/month stored as `299900` paise.

Minimum safe payment flow:

1. Client sends selected plan key only.
2. Server fetches plan from DB and creates Razorpay order.
3. Client completes checkout.
4. Client sends payment id, order id, and signature to verify endpoint.
5. Server verifies signature using Razorpay key secret.
6. Server creates/updates Payment and Subscription records.
7. Webhook endpoint keeps payment/subscription state reliable.

Do not trust price or plan data from the browser.

## 13. Redis Strategy

Use Upstash Redis for:

- Asset listing cache: `assets:list:<hash>` with short TTL.
- Popular assets cache.
- Rate limiting for download, search, and payment endpoints.
- Counters for asset views/downloads before periodic DB sync if needed.

Avoid caching sensitive user-specific payment or private profile data unless keys are scoped carefully and TTL is short.

## 14. Search and Filtering MVP

Initial search can use MongoDB/Prisma queries with normalized fields:

- `title`
- `description`
- `searchText`
- `category.slug`
- `tags.slug`
- `accessLevel`
- `type`
- `formats`

Filters:

- Search query.
- Category.
- Tags.
- Asset type.
- Access level: Free, Pro, Premium.
- Format.
- Sort: newest, popular, downloads, featured.

Later upgrade path:

- MongoDB Atlas Search.
- Typesense/Meilisearch.
- Vector search for semantic scientific asset search.

## 15. Required Server Utilities

```txt
src/lib/
  prisma.ts
  auth.ts
  admin.ts
  plans.ts
  asset-access.ts
  cloudinary.ts
  razorpay.ts
  redis.ts
  rate-limit.ts
  validators/
    asset.ts
    category.ts
    payment.ts
```

## 16. Quality Gates

Before Phase 1 is considered complete:

- User can sign up and sign in.
- User profile syncs from Clerk to MongoDB.
- Admin can create category/tag/asset.
- Asset appears in library.
- Search/filter/sort/pagination works.
- User can bookmark asset.
- User can download free asset.
- Free user cannot download Pro/Premium asset.
- User can purchase Pro/Premium with Razorpay test mode.
- Payment signature is verified server-side.
- Dashboard updates plan status.
- Admin dashboard shows assets, users, payments, and downloads.
- Build passes: `npm run build`.
- Lint passes: `npm run lint`.
