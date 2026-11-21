import test from "node:test";
import assert from "node:assert";
import { SocialBlockSchema } from "./social";
import { MAX_SOCIALS_PER_PAGE, MAX_WEBSITES_PER_PAGE } from "@/lib/limits";

test("SocialBlockSchema: validates handle and builds URL", () => {
  const result = SocialBlockSchema.safeParse({
    platform: "github",
    input: "subha1818",
  });

  assert.strictEqual(result.success, true);
  if (result.success) {
    assert.strictEqual(result.data.platform, "github");
    assert.strictEqual(result.data.url, "https://github.com/subha1818");
    assert.strictEqual(result.data.title, "GitHub");
  }
});

test("SocialBlockSchema: validates full URL input", () => {
  const result = SocialBlockSchema.safeParse({
    platform: "youtube",
    input: "https://youtube.com/@antigravity",
  });

  assert.strictEqual(result.success, true);
  if (result.success) {
    assert.strictEqual(result.data.url, "https://youtube.com/@antigravity");
  }
});

test("SocialBlockSchema: rejects wrong platform link", () => {
  const result = SocialBlockSchema.safeParse({
    platform: "instagram",
    input: "https://x.com/subha1818",
  });

  assert.strictEqual(result.success, false);
  if (!result.success) {
    assert.ok(
      result.error.issues[0].message.includes("doesn't look like an Instagram link")
    );
  }
});

test("SocialBlockSchema: handles website platform and derives hostname title", () => {
  const result = SocialBlockSchema.safeParse({
    platform: "website",
    input: "https://blog.mycoolsite.org/about",
  });

  assert.strictEqual(result.success, true);
  if (result.success) {
    assert.strictEqual(result.data.title, "blog.mycoolsite.org");
    assert.strictEqual(result.data.url, "https://blog.mycoolsite.org/about");
  }
});

test("SocialBlockSchema: rejects unsafe URL schemes", () => {
  const result = SocialBlockSchema.safeParse({
    platform: "website",
    input: "javascript:alert(1)",
  });

  assert.strictEqual(result.success, false);
});

test("Social limits rules: enforces max socials, uniqueness per platform and website limit", () => {
  assert.strictEqual(MAX_SOCIALS_PER_PAGE, 12);
  assert.strictEqual(MAX_WEBSITES_PER_PAGE, 3);

  // Helper simulating the validation rule from createSocialBlock
  function canAddSocial(
    existing: { platform: string }[],
    newPlatform: string
  ): { ok: boolean; reason?: string } {
    if (existing.length >= MAX_SOCIALS_PER_PAGE) {
      return { ok: false, reason: "limit_reached" };
    }
    if (newPlatform === "website") {
      const websiteCount = existing.filter((s) => s.platform === "website").length;
      if (websiteCount >= MAX_WEBSITES_PER_PAGE) {
        return { ok: false, reason: "website_limit_reached" };
      }
    } else {
      if (existing.some((s) => s.platform === newPlatform)) {
        return { ok: false, reason: "duplicate_platform" };
      }
    }
    return { ok: true };
  }

  // 1. Unique platform succeeds
  assert.strictEqual(canAddSocial([{ platform: "github" }], "instagram").ok, true);

  // 2. Duplicate platform rejected
  assert.strictEqual(
    canAddSocial([{ platform: "github" }], "github").reason,
    "duplicate_platform"
  );

  // 3. Website allowed up to 3 times
  const twoWebsites = [{ platform: "website" }, { platform: "website" }];
  assert.strictEqual(canAddSocial(twoWebsites, "website").ok, true);

  const threeWebsites = [{ platform: "website" }, { platform: "website" }, { platform: "website" }];
  assert.strictEqual(
    canAddSocial(threeWebsites, "website").reason,
    "website_limit_reached"
  );

  // 4. Maximum 12 blocks enforced
  const twelveSocials = Array.from({ length: 12 }, (_, i) => ({
    platform: `p${i}`,
  }));
  assert.strictEqual(canAddSocial(twelveSocials, "github").reason, "limit_reached");
});

