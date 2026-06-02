# Imagiene Design System Guide

## 1. Design Goal

Imagiene should feel like a premium scientific SaaS: clean, credible, minimal, research-focused, fast, and professional. The first implementation must prioritize backend functionality and stable UI foundations. Advanced animations and final brand polish can come after Phase 1 is working end-to-end.

## 2. Current Design Rule

Use shadcn/ui components as the foundation. Do not build random custom components when a shadcn component is available.

Build every UI in a way that supports:

- Light mode.
- Dark mode.
- Responsive layout.
- Accessible keyboard navigation.
- Clean loading states.
- Empty states.
- Error states.

## 3. Logo and Color Policy

The final brand colors will be refined after the logo is provided.

Until then, use a modern neutral scientific theme:

- Base background: zinc/slate neutral.
- Primary accent: scientific cyan/blue.
- Secondary accent: emerald/mint.
- Premium accent: violet/indigo.
- Warning/payment accent: amber.
- Destructive: red.

Use CSS variables so the logo-based colors can be swapped later without rewriting components.

Suggested temporary theme tokens:

```css
:root {
  --brand-primary: 190 92% 42%;
  --brand-secondary: 160 84% 39%;
  --brand-premium: 258 90% 66%;
  --brand-soft: 190 80% 96%;
}

.dark {
  --brand-primary: 190 92% 55%;
  --brand-secondary: 160 84% 50%;
  --brand-premium: 258 90% 72%;
  --brand-soft: 190 40% 12%;
}
```

## 4. Visual Personality

Imagiene must look:

- Scientific, not childish.
- Premium, not overly colorful.
- Minimal, not empty.
- Helpful, not complex.
- Trustworthy, because research users care about licensing and provenance.

Avoid:

- Overuse of gradients.
- Random neon colors.
- Heavy glassmorphism everywhere.
- Unnecessary animations before core functionality works.
- AI-generated image style language for the asset library.

## 5. Page Layout Rules

### Marketing pages

Use:

- Top navbar with logo, Library, Pricing, Coming Soon, Sign in, Get started.
- Hero section with clear headline.
- Strong CTA: `Explore Scientific Assets`.
- Secondary CTA: `View Pricing`.
- Feature cards.
- Trust/provenance section explaining assets are curated/human-designed/licensed.
- Pricing section.
- Footer.

### Library page

Layout:

- Left sidebar filters on desktop.
- Top horizontal filter sheet on mobile.
- Search bar at top.
- Category chips.
- Sort dropdown.
- Asset grid.
- Pagination.

Asset cards must show:

- Preview thumbnail.
- Title.
- Category.
- Access badge: Free / Pro / Premium.
- Format badges.
- Bookmark button.
- Download/open button.

### Asset detail page

Must show:

- Large preview.
- Title.
- Description.
- Category and tags.
- Access level.
- Available formats.
- License summary.
- Provenance/source information.
- Download CTA.
- Related assets.

### Dashboard

Dashboard should include:

- Welcome card.
- Current plan card.
- Downloads this month.
- Saved/bookmarked assets.
- Billing quick action.
- Recommended categories.
- Coming soon card for AI Chat and AI Canvas.

### Admin panel

Admin UI must prioritize speed and clarity:

- Sidebar navigation.
- Data tables.
- CRUD forms.
- Status badges.
- Upload area.
- Search and filter in admin lists.
- Audit-friendly metadata.

## 6. Component Rules

Use these shadcn components:

- Button
- Card
- Badge
- Input
- Textarea
- Select
- Form
- Table
- Dialog
- Sheet
- Dropdown Menu
- Tabs
- Tooltip
- Skeleton
- Alert
- Sonner Toaster
- Pagination
- Breadcrumb

Create reusable app components:

```txt
src/components/
  marketing/
    hero.tsx
    feature-grid.tsx
    pricing-cards.tsx
  library/
    asset-card.tsx
    asset-grid.tsx
    asset-filters.tsx
    asset-search.tsx
    access-badge.tsx
    format-badge.tsx
  dashboard/
    dashboard-shell.tsx
    plan-card.tsx
    download-history.tsx
  admin/
    admin-shell.tsx
    admin-sidebar.tsx
    asset-form.tsx
    asset-table.tsx
    category-form.tsx
  shared/
    empty-state.tsx
    loading-state.tsx
    error-state.tsx
    page-header.tsx
```

## 7. Responsive Rules

- Mobile first.
- Library grid: 1 column mobile, 2 columns tablet, 3-4 columns desktop.
- Admin tables should scroll horizontally on mobile.
- Filters become a `Sheet` on mobile.
- Navbar collapses into mobile menu.
- Dashboard cards stack on mobile.

## 8. Dark Mode Rules

- Use `next-themes`.
- Use CSS variables, not hardcoded colors.
- Do not use black pure backgrounds everywhere; use neutral dark surfaces.
- All borders must remain visible in dark mode.
- Asset previews must sit on a neutral checker/soft panel when transparent.

## 9. Accessibility Rules

- Buttons must have clear labels.
- Icon-only buttons need `aria-label`.
- Forms need visible labels and validation messages.
- Dialogs must have titles.
- Color must not be the only way to indicate plan/access.
- Loading states must not shift layout heavily.

## 10. UX Copy Rules

Use clear copy:

- `Explore Library`
- `Download asset`
- `Save to bookmarks`
- `Upgrade to Pro`
- `Upgrade to Premium`
- `Free asset`
- `Available in Pro`
- `Available in Premium`
- `Coming soon: AI Research Chat`
- `Coming soon: AI Canvas`

Avoid saying that generated diagrams are “AI images”. For future AI Canvas, use phrases like:

- `AI-assisted editable diagrams`
- `Structured diagram generation`
- `Mermaid-based flowcharts`
- `Editable scientific visuals`

## 11. Phase 1 UI Priority

Build UI in this order:

1. Auth pages.
2. Homepage and pricing.
3. Library listing.
4. Asset detail page.
5. Dashboard.
6. Admin panel.
7. Payment states.
8. Empty/loading/error states.
9. Final spacing and responsiveness.
10. Logo-based theme refinement later.
