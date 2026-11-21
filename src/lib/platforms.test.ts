import test from "node:test";
import assert from "node:assert";
import {
  detectPlatform,
  isUrlForPlatform,
  resolveSocialUrl,
  getPlatform,
} from "./platforms";

test("detectPlatform: matches valid hostnames with dot boundary", () => {
  assert.strictEqual(detectPlatform("https://github.com/subha1818"), "github");
  assert.strictEqual(detectPlatform("https://www.github.com/subha1818"), "github");
  assert.strictEqual(detectPlatform("https://gist.github.com/subha1818"), "github");
  assert.strictEqual(detectPlatform("https://GITHUB.COM/UPPERCASE"), "github");
  assert.strictEqual(detectPlatform("https://x.com/subha1818"), "x");
  assert.strictEqual(detectPlatform("https://twitter.com/subha1818"), "x");
  assert.strictEqual(detectPlatform("https://instagram.com/subha1818"), "instagram");
  assert.strictEqual(detectPlatform("https://youtu.be/abc123xyz"), "youtube");
  assert.strictEqual(detectPlatform("https://wa.me/1234567890"), "whatsapp");
  assert.strictEqual(detectPlatform("https://threads.net/@subha1818"), "threads");
});

test("detectPlatform: rejects spoofed or substring hostnames", () => {
  assert.strictEqual(detectPlatform("https://evilgithub.com/subha1818"), null);
  assert.strictEqual(detectPlatform("https://github.com.evil.com/subha1818"), null);
  assert.strictEqual(detectPlatform("https://notgithub.com/subha1818"), null);
  assert.strictEqual(detectPlatform("https://fakeinstagram.com"), null);
  assert.strictEqual(detectPlatform("https://x.com.bad.com"), null);
});

test("detectPlatform: handles URLs with ports, paths and queries", () => {
  assert.strictEqual(detectPlatform("https://github.com:443/repo?query=1"), "github");
  assert.strictEqual(detectPlatform("http://reddit.com/r/reactjs"), "reddit");
});

test("isUrlForPlatform: validates correct platform match", () => {
  assert.strictEqual(isUrlForPlatform("github", "https://github.com/subha1818"), true);
  assert.strictEqual(isUrlForPlatform("github", "https://gist.github.com/subha1818"), true);
  assert.strictEqual(isUrlForPlatform("github", "https://x.com/subha1818"), false);
  assert.strictEqual(isUrlForPlatform("github", "https://evilgithub.com"), false);
  assert.strictEqual(isUrlForPlatform("website", "https://myblog.org/post"), true);
});

test("resolveSocialUrl: handles and URL inputs", () => {
  // Strips leading @
  assert.strictEqual(
    resolveSocialUrl("instagram", "@subhajit"),
    "https://instagram.com/subhajit"
  );
  assert.strictEqual(
    resolveSocialUrl("x", "subhajit"),
    "https://x.com/subhajit"
  );
  assert.strictEqual(
    resolveSocialUrl("youtube", "channelName"),
    "https://youtube.com/@channelName"
  );
  assert.strictEqual(
    resolveSocialUrl("github", "subha1818"),
    "https://github.com/subha1818"
  );
  assert.strictEqual(
    resolveSocialUrl("linkedin", "subha-patra"),
    "https://linkedin.com/in/subha-patra"
  );

  // Full URLs preserved
  assert.strictEqual(
    resolveSocialUrl("github", "https://github.com/subha1818"),
    "https://github.com/subha1818"
  );
  assert.strictEqual(
    resolveSocialUrl("spotify", "open.spotify.com/artist/123"),
    "https://open.spotify.com/artist/123"
  );

  // WhatsApp digits only
  assert.strictEqual(
    resolveSocialUrl("whatsapp", "+1 (555) 123-4567"),
    "https://wa.me/15551234567"
  );
});

test("getPlatform: returns correct platform object", () => {
  const p = getPlatform("discord");
  assert.ok(p);
  assert.strictEqual(p?.label, "Discord");
  assert.strictEqual(p?.acceptsHandle, false);
});

