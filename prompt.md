# Imagien - Product Build Prompt

I am building a full-stack web application named **Imagien**.

## Product Vision

Imagien is a SaaS application for scientific illustration and research scholars.

The main problem it solves: when publishing research papers, the images/illustrations used should not be fully AI-generated. Researchers need high-quality graphical assets (for example: virus icons, bacteria visuals, and other important scientific illustrations).

So I need a full-fledged **Asset Library System** where users can:

- Browse an icon/image library
- Sort and search assets
- Find relevant icons quickly
- Download free assets for free
- Access paid assets via subscription

Pricing examples:

- **Pro**: 1499/month
- **Premium**: 2999/month

There should be:

- Proper user signup/signin
- Hero-section CTA leading users to image browsing
- Login required to access/download assets
- Bookmark/save functionality
- User dashboard with account info, current plan, and quick action buttons for key services/features

## Future Services (Planned, Not Phase 1)

This is not only an asset library. I also want:

### 1. Research Chat System

- ChatGPT-style interface
- Users can attach research papers/documents
- RAG-based LLM chat for research Q&A on their own documents
- Privacy-focused and dedicated/personalized for scientific research use cases
- Key point: unlike generic public chat tools, user information should remain private and not be used for training

### 2. AI Canvas

- Separate page with editable canvas
- Use AI chat assistance to generate clear flowcharts/diagrams
- Output should **not** be AI-generated images
- Use Mermaid and/or strong visualization tooling behind the scenes
- Users can paste/define research content and generate needed graphs/illustrations
- Should support editing flowcharts, graphs, and mind maps
- Easy customization with rich features
- Interface inspiration: Eraser.io and Excalidraw
- Users can create manually and also edit with AI assistance

## Current Build Focus (Phase 1)

For now, I want to focus on backend and working functionality first, then improve UI/UX.

I am using Shadcn UI as the foundation and want the application built in a very standard and professional way.

### Tech Stack

- Next.js
- MongoDB + Prisma ORM
- Clerk (authentication)
- Razorpay (payments)
- Shadcn UI (components)
- Cloudinary (asset management)
- Upstash Redis (caching)

### Scope for Phase 1

Focus only on delivering a successful **Asset Library System**, including:

- Admin panel for all necessary CRUD operations on icons/images
- Frontend with full authentication flows
- User dashboard
- Pricing/subscription features
- All core required functionality

## On Hold Until Phase 1 Is Live

The **Research Chat** and **AI Canvas** modules are on hold.

They should be implemented only after:

- Backend + frontend pipeline is complete
- Payment flow is complete
- Full asset library is set up and live

After that, these modules can be built using AI SDK and AI Elements libraries for development/design.

## What I Need Right Now

For Phase 1, provide all required structure and MD files so I can give them to Cursor/Claude Code and start development from scratch.

Please generate:

- `ARCHITECTURE.md` (overall architecture, key application features, admin panel, and concept explained above)
- `DESIGN.md` (design rules and system guidance)
- `CLAUDE.md`
- `AGENTS.md` (agent rules for structured, phase-wise development with Claude Code/Cursor)

### Design Note

I will share the logo later.

When finalizing design guidance, keep it modern and compatible with both light and dark mode, and choose the best theme color codes based on the logo.

## Build Priority Instructions

Start with structure and required MD files.

Important:

- First prioritize all backend APIs
- Use Shadcn for UI components
- Complete functionality first
- Improve/customize design and animation later

## Setup Requirements

Also provide:

- Step-by-step installation for Next.js and all required libraries/packages
- `.env.example` with all required environment variables/credentials placeholders

I want to do this basic setup before giving the full prompt to Cursor.

## Request

Act as a senior full-stack engineer and provide a full pipeline plan following best Next.js practices.