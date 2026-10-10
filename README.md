# MyLinks

A bold, playful Linktree-style link-in-bio SaaS built with Next.js App Router, Tailwind CSS, and TypeScript.

## Tech Stack
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS (Custom solid-color design system)
- **Fonts:** Bricolage Grotesque & DM Sans
- **Icons:** Lucide React
- **Validation:** Zod
- **Database (Phase 2):** PostgreSQL on Neon with Drizzle ORM
- **Auth (Phase 2):** Better Auth (Google OAuth)

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) with your browser.

## Database Workflow
Because we use Drizzle ORM, schema changes must be done carefully to maintain a correct migration history:
1. Modify `src/server/db/schema.ts` to add or change tables.
2. Run `npm run db:generate` to create a new migration file in `drizzle/`.
3. Review the generated SQL.
4. Run `npm run db:migrate` to safely apply the changes to the live database.
**NEVER use `drizzle-kit push` for production schema changes**, as it bypasses the migration history.

## Reviewing Reports
User reports (spam, inappropriate, etc.) are stored in the `reports` table. Since there is no admin dashboard yet, you must review these manually using Drizzle Studio:
1. Run `npm run db:studio`.
2. Open the browser link provided by the studio.
3. Open the `reports` table to review user-submitted reports and take action on the `status` field.
