import { test } from "node:test";
import assert from "node:assert/strict";
import { auth } from "./auth";

test("auth configuration has 30-day lifetime and 1-day sliding refresh", async () => {
  assert.equal(auth.options.session?.expiresIn, 60 * 60 * 24 * 30);
  assert.equal(auth.options.session?.updateAge, 60 * 60 * 24);
  assert.equal(auth.options.session?.cookieCache?.enabled, true);
  assert.equal(auth.options.session?.cookieCache?.maxAge, 300);
});

test("sessionToken cookie attributes are persistent, httpOnly, and lax", async () => {
  const context = await auth.$context;
  const cookieConfig = context.authCookies.sessionToken;

  assert.equal(cookieConfig.name, "better-auth.session_token");
  assert.equal(cookieConfig.attributes.httpOnly, true);
  assert.equal(cookieConfig.attributes.sameSite, "lax");
  assert.equal(cookieConfig.attributes.path, "/");
  assert.equal(cookieConfig.attributes.maxAge, 2592000); // 30 days in seconds
});

test("invalid or missing session headers safely returns null without throwing", async () => {
  const res = await auth.api.getSession({
    headers: new Headers({
      cookie: "better-auth.session_token=invalid_or_expired_token",
    }),
  });
  assert.equal(res, null);
});
