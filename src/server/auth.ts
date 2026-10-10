import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/server/db";
import * as schema from "@/server/db/schema";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: [
    process.env.BETTER_AUTH_URL,
    process.env.NEXT_PUBLIC_APP_URL,
  ].filter(Boolean) as string[],

  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },

  // Cookie session only – never store tokens in localStorage
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5-minute cache in cookie
    },
  },

  // Only accept Google accounts with verified email
  user: {
    additionalFields: {},
  },

  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
