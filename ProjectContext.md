# Project: Link-in-Bio SaaS (working name: `YourApp`)

> This file is the source of truth for the project. Read it fully before writing any code.
> Follow it strictly. If something here conflicts with a request, ask before deviating.
> Always check the current official docs for any library before using its API (versions change).

---

## 1. What we are building

A Linktree-style SaaS. Anyone can:

1. Sign in with **Continue with Google** (the only auth method for now).
2. Choose a unique username.
3. Build a public link-in-bio page at `yourapp.com/username`.
4. Add, edit, reorder and delete links and social profiles.
5. Customize profile (avatar, display name, bio) and theme.

### MVP scope (build now)
- Landing page
- Authentication: **Google sign-in only** (no passwords, no OTP, no email sending), plus username onboarding
- Dashboard: profile editor, link CRUD with drag-and-drop ordering, basic theme customization
- Public profile page at `/{username}` (SSR, SEO, Open Graph tags)
- Click tracking (record events only; no analytics dashboard yet)

### Later (do NOT build now, but do not block them)
Analytics dashboard, custom domains, advanced themes, QR codes, paid plans, multiple pages per user, scheduled links, and email + password login with OTP verification (needs a verified domain for Resend first).

---

## 2. Tech stack

| Area | Choice |
|---|---|
| Framework | Next.js (latest stable, App Router) with TypeScript |
| Styling | Tailwind CSS |
| Backend | Next.js Route Handlers + Server Actions (single app, no separate server for MVP) |
| Database | PostgreSQL on Neon (use the **pooled** connection string) |
| ORM | Drizzle ORM + drizzle-kit migrations (Neon serverless driver) |
| Auth | Better Auth with the Google OAuth provider only. Keep the standard user/account tables so other methods can be added later. Verify against current docs |
| Image storage | Vercel Blob (Hobby plan, 1 GB). Never store images in Postgres. Access it only through `src/server/storage.ts` so the provider can be swapped later |
| Validation | Zod (every input, client and server) |
| Drag and drop | dnd-kit |
| Icons | lucide-react |
| Deployment (later) | Vercel |

Keep business logic in `src/server/services/` so it can be moved to a separate service later.

---

## 3. Folder structure

```
src/
  app/
    (marketing)/          # landing page, pricing (later)
      page.tsx
    (auth)/               # login page (Continue with Google) and username onboarding
    (dashboard)/          # protected app: /dashboard, /dashboard/appearance, /dashboard/settings
    [username]/           # PUBLIC profile page (SSR)
      page.tsx
    api/
      auth/[...all]/      # auth handler
      click/[linkId]/     # click tracking redirect
      upload/             # Vercel Blob upload handler (validates session, type, size)
  components/
    ui/                   # buttons, inputs, modals (reusable)
    landing/
    dashboard/
    profile/              # public profile + theme renderer
  server/
    db/
      schema.ts           # Drizzle schema
      index.ts            # db client
    services/             # users, pages, blocks, themes, clicks
    auth.ts               # auth config
    storage.ts            # Vercel Blob wrapper (uploadImage, deleteImage)
  lib/
    validators/           # Zod schemas
    reserved-usernames.ts
    theme.ts              # theme types, defaults, validation
    utils.ts
drizzle/                  # generated migrations
```

---

## 4. Database model (Postgres)

Use `users -> pages -> blocks` even though each user has one page for now.

- **users**: id, email (unique, case-insensitive), email_verified, name, image, created_at (no password column; Google only)
- **pages**: id, user_id (FK), username (unique, case-insensitive via `lower(username)` unique index), display_name, bio, avatar_url, theme (jsonb), is_published, created_at, updated_at
- **blocks**: id, page_id (FK), type (`link` for now; keep extensible), title, url, icon, position (fractional index string or gapped integer), is_visible, created_at, updated_at
- **click_events**: id, block_id (FK), page_id (FK), created_at, referrer, country, device
- Auth library tables (sessions, accounts, verification) as required by Better Auth

Rules:
- Index `blocks(page_id, position)` and `click_events(block_id, created_at)`.
- Usernames: 3-30 chars, lowercase letters, numbers, `_` and `-`, stored lowercase.
- Block ordering must not rewrite every row on reorder.

---

## 5. Authentication flow

Google is the **only** sign-in method for the MVP. No passwords, no OTP, no transactional email.

1. **Login / Register (same button)**: "Continue with Google". First login creates the user, later logins reuse it.
2. **Email trust**: only accept the Google account if the provider reports the email as verified.
3. **Onboarding**: after the first login, if the user has no page, force a "choose username" step (validate format, reserved list, uniqueness) before reaching the dashboard.
4. **Profile prefill**: use the Google name and photo as defaults for display name and avatar (the user can change them).
5. **Logout** and **delete account** in settings.

Security requirements:
- Sessions in httpOnly, secure, sameSite cookies. No tokens in localStorage.
- Never roll custom crypto or custom OAuth code; use the auth library.
- Rate-limit the username-availability check and all mutations.
- Protect all dashboard routes and mutations with a server-side session check. Always check that the resource belongs to the logged-in user.

Google Cloud setup (manual, done by the developer):
- Create a project in Google Cloud Console and an OAuth 2.0 Web client.
- Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google` and the production URL equivalent (confirm the exact path in the auth library docs).
- While the consent screen is in "Testing", only added test users can log in. Switch to "In production" before sharing the site publicly.

---

## 6. Public profile page (`/[username]`)

- Server-rendered. Fast first load, SEO-friendly.
- `generateMetadata` for title, description and Open Graph / Twitter image.
- 404 for unknown or unpublished usernames.
- Cache and revalidate on edit (use `revalidatePath` / tags).
- Link clicks go through `/api/click/[linkId]`, which records the event and redirects to the destination.
- Reserved usernames (never allowed): `admin, api, app, dashboard, login, register, signup, logout, settings, pricing, about, help, support, terms, privacy, verify-email, forgot-password, reset-password, _next, static, public, assets, www, me, null, undefined`.

---

## 7. Themes

- Theme is a **validated JSON config**, not CSS. Never accept raw custom CSS.
- Shape (extendable): `{ background: {type, value}, textColor, buttonStyle: {shape, fill, color}, font, layout }`
- Zod schema in `lib/theme.ts`, plus a few default presets.
- One `ThemeRenderer` converts the JSON into CSS variables / Tailwind classes.

---

## 8. Security checklist (apply everywhere)

- Validate and sanitize all URLs: only `http:` and `https:`. Block `javascript:`, `data:` and similar.
- Validate uploads: allowed types (jpeg, png, webp), max size (e.g. 2 MB). Upload to Vercel Blob through an authenticated server handler that checks the session, type and size. Use generated file names, never trust the original name. Delete the old avatar when a new one is uploaded.
- Zod validation on every server action and route handler.
- No secrets in client code. Only `NEXT_PUBLIC_*` variables are exposed.
- Escape all user content. No `dangerouslySetInnerHTML` with user data.
- Add a "Report this page" mechanism later in the roadmap.

---

## 9. Environment variables

Create `.env.local` (never commit it) and a committed `.env.example` with empty values:

```
DATABASE_URL=            # Neon pooled connection string
BETTER_AUTH_SECRET=      # long random string
BETTER_AUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
BLOB_READ_WRITE_TOKEN=   # Vercel Blob store token
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 10. Setup steps (Phase 0)

1. Create the Next.js app: TypeScript, Tailwind, App Router, `src/` directory, ESLint.
2. Install: `drizzle-orm`, `drizzle-kit`, `@neondatabase/serverless`, `zod`, `better-auth`, `@vercel/blob`, `@dnd-kit/core`, `@dnd-kit/sortable`, `lucide-react`.
3. Create the folder structure from section 3.
4. Add `.env.example` and make sure `.env*` is in `.gitignore`.
5. Configure Drizzle (`drizzle.config.ts`) and the Neon client in `src/server/db/index.ts`.
6. Add npm scripts: `db:generate`, `db:migrate`, `db:studio`.
7. Initialize git and make the first commit.

---

## 11. Build phases (we do ONE phase at a time)

- **Phase 1: Landing page.** Hero, features, how it works, footer, responsive, with a sample profile mockup. No backend yet.
- **Phase 2: Authentication.** Continue with Google, session handling, username onboarding, route protection, logout.
- **Phase 3: Dashboard.** Profile editor, link CRUD, drag-and-drop reorder, avatar upload (Vercel Blob), live preview.
- **Phase 4: Public profile page.** SSR page, metadata, click tracking, caching.
- **Phase 5: Themes.** Theme editor with live preview, presets.
- **Later:** analytics, QR codes, custom domains, paid plans.

Do not start the next phase until told. Do not build features outside the current phase.

---

## 12. Coding rules

- TypeScript strict mode. No `any` unless unavoidable and commented.
- Server Components by default; add `"use client"` only when needed.
- Small, reusable components. Keep files focused.
- Mobile-first, accessible UI (labels, focus states, contrast, keyboard support).
- Handle loading, empty and error states in every screen.
- Meaningful commit after each completed task.
- After each phase: summarize what was built, list files changed, and note anything needing manual setup (keys, dashboards, DNS).

---

## 13. Design direction

Clean, modern and minimal. Neutral base with one strong accent color, generous spacing, rounded corners, subtle motion. The public profile page should feel fast and polished on mobile first, since most visitors arrive from Instagram or WhatsApp.
