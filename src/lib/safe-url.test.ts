import test from "node:test";
import assert from "node:assert";
import { isSafeHttpUrl } from "./safe-url";

test("valid https URLs", () => {
  assert.strictEqual(isSafeHttpUrl("https://example.com"), true);
  assert.strictEqual(isSafeHttpUrl("https://example.com/path?query=1#hash"), true);
  assert.strictEqual(isSafeHttpUrl("http://example.co.uk"), true);
});

test("no scheme prepends https in caller, but the helper itself rejects no scheme", () => {
  // isSafeHttpUrl expects a full URL. The caller prepends https://.
  assert.strictEqual(isSafeHttpUrl("example.com"), false); 
});

test("rejects javascript:", () => {
  assert.strictEqual(isSafeHttpUrl("javascript:alert(1)"), false);
  assert.strictEqual(isSafeHttpUrl("JaVaScRiPt:alert(1)"), false);
});

test("rejects data:", () => {
  assert.strictEqual(isSafeHttpUrl("data:text/html,<script>alert(1)</script>"), false);
});

test("rejects other schemes", () => {
  assert.strictEqual(isSafeHttpUrl("ftp://x.com"), false);
  assert.strictEqual(isSafeHttpUrl("file:///etc/passwd"), false);
  assert.strictEqual(isSafeHttpUrl("tel:1234567890"), false);
});

test("rejects protocol-relative URLs without protocol", () => {
  assert.strictEqual(isSafeHttpUrl("//evil.com"), false);
});

test("rejects credentials", () => {
  assert.strictEqual(isSafeHttpUrl("https://user:pass@x.com"), false);
});

test("rejects localhost and single-label hosts", () => {
  assert.strictEqual(isSafeHttpUrl("http://localhost:3000"), false);
  assert.strictEqual(isSafeHttpUrl("http://local"), false);
});

test("rejects IP addresses", () => {
  assert.strictEqual(isSafeHttpUrl("http://127.0.0.1"), false);
  assert.strictEqual(isSafeHttpUrl("http://[::1]"), false);
  assert.strictEqual(isSafeHttpUrl("http://192.168.1.1"), false);
});

test("rejects internal TLDs", () => {
  assert.strictEqual(isSafeHttpUrl("http://my-service.local"), false);
  assert.strictEqual(isSafeHttpUrl("http://app.internal"), false);
});

test("handles whitespace appropriately (rejected by URL constructor usually or handled)", () => {
  assert.strictEqual(isSafeHttpUrl("  https://example.com  "), true); // URL constructor trims it
});
