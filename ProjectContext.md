# Project Documentation: MyLinks

> Source of truth for MyLinks architecture, data models, design tokens, security policies, and roadmap.
> Last updated: Step 6C Polish Pass (Completed).

---

## 1. What is MyLinks?

MyLinks is a high-craft, playful Linktree-style link-in-bio platform for creators. Anyone can:
1. Sign in with **Continue with Google** in one click.
2. Claim a distinct, unique username at `mylinkz.vercel.app/<username>`.
3. Add, edit, toggle visibility, and drag-and-drop reorder links in real time.
4. Select from 14 curated, accessible theme presets (solids, retro patterns, gradients) with full button shape and font customization.
5. Track public profile engagement with privacy-first link click recording.

---

## 2. Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack, Partial Prerendering, Server Actions, Route Handlers)
- **Language:** TypeScript 5 (Strict mode)
- **Styling:** Tailwind CSS v4 (Custom brand tokens, zero gradients/glows in app shell, solid bold surfaces)
- **Fonts:** Bricolage Grotesque (Headings), DM Sans (Body), plus custom theme fonts: Fraunces, DM Mono, Archivo, Caveat
- **Authentication:** Better Auth with Google OAuth 2.0 provider only
- **Database:** PostgreSQL on Neon Serverless (Pooled connection)
- **ORM:** Drizzle ORM + Drizzle Kit (Strict migration workflow)
- **Storage:** Vercel Blob (`@vercel/blob`) for secure avatar upload and automatic deletion
- **Validation:** Zod schemas on both client and server boundaries
- **Interactions:** `@dnd-kit/core` and `@dnd-kit/sortable` for link list ordering
- **Deployment:** Vercel Global Edge & Serverless network

---

## 3. Folder Structure

```
src/
  app/
    (marketing)/               # Public landing page (static ○), /privacy, /terms
      page.tsx
    (auth)/                    # Authentication & Onboarding
      login/                   # Two-column login with real live ProfileView mockup
      onboarding/              # Username claim with suggestions and live preview
    (dashboard)/               # Protected creator dashboard
      dashboard/               # Links manager with drag & drop
      dashboard/appearance/    # 14 curated themes & appearance settings
      dashboard/settings/      # Account settings & logout
    [username]/                # Public profile page (SSR + tag caching)
      not-found.tsx            # Branded generic 404
      opengraph-image.tsx      # Dynamic Open Graph card
    api/
      auth/[...all]/           # Better Auth handler
      click/[linkId]/          # Privacy-friendly click redirect
      upload/avatar/           # Vercel Blob avatar upload handler
    icon.tsx                   # 32x32 Forest Star on Lime Circle
    apple-icon.tsx             # 180x180 Forest Star on Lime Circle
    manifest.ts                # PWA install metadata
    not-found.tsx              # Global 404 page
    error.tsx                  # Global error boundary with digest
    global-error.tsx           # Fatal root error boundary
  components/
    brand/                     # StarLoader, StarMark, AuthBackground
    dashboard/                 # OverviewStrip, LinksList, ProfileForm, PhonePreview
    landing/                   # Navbar, HeroStage, StoryScroll, ThemeTrack, Faq
    profile/                   # ProfileView (reusable theme renderer)
    ui/                        # Button, Card, Avatar, Input, Switch, Modal
  server/
    db/
      schema.ts                # Drizzle schema definitions
      index.ts                 # Database client connection
    services/                  # users, pages, blocks, clicks, reports
    session.ts                 # Server session verification helpers
    storage.ts                 # Vercel Blob upload/delete wrapper
  lib/
    auth-client.ts             # Better Auth client
    rate-limit.ts              # In-memory sliding window limiter
    site.ts                    # Brand metadata & constants
    theme.ts                   # Theme schemas, validator & CSS generator
    theme-presets.ts           # 14 WCAG AA verified presets
    validators/                # Zod schemas (username, links, profile)
drizzle/                       # Drizzle migration files
```

---

## 4. Data Model (PostgreSQL)

- **`users`**: `id`, `name`, `email`, `email_verified`, `image`, `created_at`, `updated_at`
- **`sessions`**: `id`, `user_id`, `token`, `expires_at`, `ip_address`, `user_agent`
- **`accounts`**: `id`, `user_id`, `account_id`, `provider_id`, `access_token`, `refresh_token`, `expires_at`
- **`verifications`**: `id`, `identifier`, `value`, `expires_at`
- **`pages`**: `id`, `user_id` (FK), `username` (unique case-insensitive index), `display_name`, `bio`, `avatar_url`, `theme` (JSONB), `is_published`, `created_at`, `updated_at`
- **`blocks`**: `id`, `page_id` (FK), `type` ('link'), `title`, `url`, `icon`, `position` (integer index), `is_visible`, `click_count`, `created_at`, `updated_at`
- **`click_events`**: `id`, `block_id` (FK), `page_id` (FK), `referrer`, `country`, `device`, `created_at`
- **`reports`**: `id`, `page_id` (FK), `reason`, `details`, `status` ('pending', 'reviewed', 'resolved', 'dismissed'), `created_at`

---

## 5. Privacy & Click Tracking Facts

When a visitor clicks a link on a public `/[username]` profile:
- **What is recorded:** Block ID, Page ID, ISO timestamp, Referrer domain, Device type (Mobile, Tablet, Desktop via User-Agent hint), Country code (from GeoIP header).
- **What is NOT recorded:** Personal names, exact IP addresses (never saved), raw user agents, browser fingerprinting, or tracking cookies.
- **Redirect mechanism:** `/api/click/[linkId]` logs the event asynchronously and redirects to destination via HTTP 307.

---

## 6. Caching & Revalidation Tags

- Public profile pages use Next.js Cache with tag: `page:<username_lowercase>`.
- When links or profile settings change in the dashboard, the server action invalidates the cache immediately:
  ```ts
  revalidateTag(`page:${username.toLowerCase()}`, { expire: 0 });
  ```
- Static marketing pages (`/`, `/privacy`, `/terms`) are fully prerendered as static HTML (`○`).

---

## 7. Design System & Theme Presets

- **Core Palette:**
  - Lime: `#D4E83A`
  - Forest: `#1F4D1A`
  - Ink: `#14181F`
  - Cream: `#F5F4EF`
  - Lilac: `#EBC4EE`
  - Mustard: `#E0A92E`
  - Mint: `#BFEBD6`
  - Tomato: `#FF5A36`
  - Hairline: `#E7E5DC`
- **14 Curated Presets:**
  - Sunrise, Lilac, Forest, Classic Minimal, Bubblegum, Citrus, Blueprint, Midnight Neon, Matcha, Peach, Espresso, Lavender Dream, Cyber Grid, Neo Memphis.
  - All 14 presets pass automated WCAG AA contrast ratio checks (>= 4.5:1 for body and button text).
- **Primitives:** `Button`, `Card`, `StarLoader`, `StarMark`, `Avatar`, `Input`, `Switch`, `Modal`. Flat solid surfaces only; no glow, blur blobs, or synthetic glassmorphism.

---

## 8. Security Headers

Configured in `next.config.ts`:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()`
- `Content-Security-Policy: frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'`

---

## 9. Completed Phases

- **Phase 0:** Setup, tooling, TypeScript, Tailwind v4, Neon DB connection
- **Phase 1:** Core models, Drizzle migrations, Better Auth Google integration
- **Phase 2:** Dashboard link CRUD, drag-and-drop reordering, Vercel Blob avatar uploads
- **Phase 3:** Public profile SSR, Open Graph image generation, click tracking
- **Phase 4:** Theme engine, 14 presets, WCAG AA contrast testing, tag revalidation
- **Phase 5:** Marketing landing page, interactive story scroll, privacy receipt demo
- **Phase 6A & 6B:** Dashboard & marketing visual polish, branded StarLoader, mobile overview card
- **Phase 6C (Final Polish):**
  - Two-column login page with live ProfileView preset rotation and friendly OAuth alerts
  - Two-column onboarding page with live preview phone, username suggestions, and true copy
  - Custom branded 404, profile 404, global error, and dashboard error pages
  - PWA Web Manifest, 32x32 star icon, 180x180 Apple touch icon, and light color scheme
  - Accessibility skip links, landmarks, full test suite (50 passing tests), and complete docs

---

## 10. Next Features Roadmap (Future Phases)

1. **Analytics Dashboard:** Visual charts for daily clicks, referrers, and country breakdown.
2. **Social Icon Row:** Quick-tap social link buttons (X, GitHub, Instagram, YouTube, etc.).
3. **QR Code Generator:** Downloadable vector & raster QR code for public profile link.
4. **Rich Block Types:** Headers, text callouts, music player embeds, video embeds.
5. **Distributed Rate Limiting:** Centralized Redis / Upstash rate limiting for multi-instance serverless scale.
6. **Custom Domains:** Connect custom apex/subdomains via Vercel Domains API.
7. **Email + Magic Link Login:** Resend / transactional email auth when verified custom domain is attached.
8. **Username Modification:** Safe handle migration with legacy redirect aliases.
9. **Account Deletion & Data Export:** Self-service profile purge and JSON data download.
10. **Admin Reports Portal:** Protected back-office view to resolve flagged profile reports.
