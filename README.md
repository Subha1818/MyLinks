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

## Deployment

1. **Environment Variables**: Configure all variables from `.env.example` in your Vercel project settings. Ensure `NEXT_PUBLIC_APP_URL` and `BETTER_AUTH_URL` point to your production URL (e.g., `https://mylinks.vercel.app`).
2. **Database Migrations**: Migrations do **not** run automatically on build. You must manually apply them against your production database using your local machine:
   - Temporarily set your local `.env.local`'s `DATABASE_URL` to your production database URL (use the direct connection string if the pooled one causes errors).
   - Run `npm run db:migrate`.
   - Revert your `.env.local` to the local development database URL immediately.
3. **Google OAuth**: Add your production redirect URI (e.g., `https://mylinks.vercel.app/api/auth/callback/google`) to your Google Cloud Console OAuth 2.0 Web Client authorized redirect URIs.

## Known Limitations

- **Rate Limiting**: The current rate limiters (for username checks, uploads, mutations, clicks, and reports) use an in-memory `Map`. On serverless platforms like Vercel, this state is isolated per serverless instance and lost when the instance spins down. For a true global rate limit in production, these should be moved to a centralized store like Redis or Upstash.
