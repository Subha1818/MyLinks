# MyLinks

A bold, playful Linktree-style link-in-bio SaaS built with Next.js App Router, Tailwind CSS, TypeScript, Better Auth, and PostgreSQL on Neon.

## What is MyLinks?

MyLinks gives creators, designers, and developers a clean, ultra-fast public link-in-bio page at `mylinkz.vercel.app/<username>`. Sign in in one click with Google, claim a unique username, customize themes across 14 curated presets (flat solids, retro patterns, subtle gradients), and share links with privacy-respecting click tracking.

---

## Tech Stack (Current Reality)

| Layer | Technology | Details |
|---|---|---|
| **Framework** | Next.js 16 (App Router + Turbopack) | Fast Server Components, Route Handlers, Server Actions, Partial Prerendering |
| **Language** | TypeScript | Strict mode, zero `any` types |
| **Styling** | Tailwind CSS v4 | Flat solid color tokens, Bricolage Grotesque & DM Sans typography |
| **Authentication** | Better Auth (Google OAuth only) | 30-day session cookies, 1-day sliding refresh, secure httpOnly cookies |
| **Database** | PostgreSQL on Neon | Serverless pooled connection (`@neondatabase/serverless`) |
| **ORM** | Drizzle ORM | Type-safe queries and migration history (`drizzle-kit`) |
| **Asset Storage** | Vercel Blob | Authenticated avatar uploads (`@vercel/blob`) |
| **Drag & Drop** | @dnd-kit/core & @dnd-kit/sortable | Smooth keyboard & pointer link reordering with fractional/index keys |
| **Icons & Brand** | Lucide React + Custom StarMark & StarLoader | Accessible SVG primitives and micro-animations |
| **Hosting** | Vercel | Edge routing, global CDN, serverless functions |

---

## Project Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the Next.js development server on `http://localhost:3000` |
| `npm run build` | Runs TypeScript validation and creates an optimized production bundle |
| `npm run start` | Runs the compiled production server locally |
| `npm run lint` | Runs ESLint 9 checks across all source files |
| `npm test` | Runs Node test runner with `tsx` on all `src/**/*.test.ts` suites |
| `npm run db:generate` | Generates new SQL migration files in `drizzle/` from schema changes |
| `npm run db:migrate` | Runs pending database migrations against the configured Neon database |
| `npm run db:push` | Pushes schema directly (development use only; never in production) |
| `npm run db:studio` | Launches Drizzle Studio GUI for inspecting database rows and reports |

---

## Environment Variables

Copy `.env.example` to `.env.local` and populate the values:

```env
# Database (Neon PostgreSQL pooled connection)
DATABASE_URL=

# Better Auth
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Image Storage (Vercel Blob)
BLOB_READ_WRITE_TOKEN=

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Database Workflow

Because we use Drizzle ORM with Neon serverless PostgreSQL, production schema stability requires maintaining a strict migration record:
1. Edit table definitions in `src/server/db/schema.ts`.
2. Generate migration SQL files:
   ```bash
   npm run db:generate
   ```
3. Review the generated SQL in `drizzle/`.
4. Apply migrations:
   ```bash
   npm run db:migrate
   ```
> **WARNING:** Never use `drizzle-kit push` for production databases; always use `db:generate` and `db:migrate` to preserve revision history and prevent data loss.

---

## Deployment to Vercel

1. **Repository Setup**: Push repository to GitHub and import the project into Vercel.
2. **Environment Configuration**: In Vercel Project Settings > Environment Variables, configure:
   - `DATABASE_URL` (Neon pooled connection string)
   - `BETTER_AUTH_SECRET` (cryptographically random 64-char hex string)
   - `BETTER_AUTH_URL` (`https://mylinkz.vercel.app`)
   - `NEXT_PUBLIC_APP_URL` (`https://mylinkz.vercel.app`)
   - `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`
   - `BLOB_READ_WRITE_TOKEN` (from Vercel Blob store)
3. **Google Cloud Console OAuth**: In Google Auth Platform > Credentials, add your authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (local dev)
   - `https://mylinkz.vercel.app/api/auth/callback/google` (production)
4. **Deploy**: Trigger a production deployment.

---

## Reviewing Reports

Users can flag offensive or spam public profiles via the "Report this page" modal. Reports are captured in the `reports` database table.
To review submitted reports:
1. Run `npm run db:studio` locally or open Neon Console SQL Editor.
2. Query pending reports:
   ```sql
   SELECT * FROM reports WHERE status = 'pending' ORDER BY created_at DESC;
   ```
3. Review reason and details, and update status (`reviewed`, `resolved`, or `dismissed`).

---

## Known Limitations

- **Rate Limiting**: Rate limiters for username availability checks, avatar uploads, link click recording, and mutations currently use an in-memory sliding window (`Map`). Under serverless scale with multiple instances, migrate to a distributed Redis / Upstash key-value store.
- **Username Modification**: Usernames are permanently locked upon initial onboarding. Changing usernames is not yet implemented.
- **Google OAuth Only**: Google sign-in is currently the sole supported authentication method (no passwords or email magic links).
