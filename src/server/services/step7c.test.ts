import test from "node:test";
import assert from "node:assert";
import { validateGroupedReorder } from "./blocks";
import { isTrustedImageUrl } from "@/lib/urls";
import { BlockSchema, EditBlockSchema, HeaderSchema } from "@/lib/validators/block";
import {
  MAX_THUMBNAILS_PER_PAGE,
  MAX_HIGHLIGHTED_PER_PAGE,
  MAX_HEADERS_PER_PAGE,
} from "@/lib/limits";

// 1. Grouped reorder with headers
test("validateGroupedReorder: succeeds for mixed links and headers in group 'link'", () => {
  const existing = [
    { id: "l1", type: "link" },
    { id: "h1", type: "header" },
    { id: "l2", type: "link" },
    { id: "s1", type: "social" },
  ];
  const result = validateGroupedReorder(existing, "link", ["h1", "l2", "l1"]);
  assert.strictEqual(result.ok, true);
});

test("validateGroupedReorder: fails when social id is placed in link/header group", () => {
  const existing = [
    { id: "l1", type: "link" },
    { id: "h1", type: "header" },
    { id: "s1", type: "social" },
  ];
  const result = validateGroupedReorder(existing, "link", ["h1", "l1", "s1"]);
  assert.strictEqual(result.ok, false);
  if (!result.ok) {
    assert.strictEqual(result.code, "wrong_group");
  }
});

test("validateGroupedReorder: fails when header id is placed in social group", () => {
  const existing = [
    { id: "h1", type: "header" },
    { id: "s1", type: "social" },
  ];
  const result = validateGroupedReorder(existing, "social", ["h1"]);
  assert.strictEqual(result.ok, false);
  if (!result.ok) {
    assert.strictEqual(result.code, "wrong_group");
  }
});

// 2. isTrustedImageUrl defense-in-depth
test("isTrustedImageUrl: validates trusted Vercel Blob URLs", () => {
  assert.strictEqual(
    isTrustedImageUrl("https://abc123xyz.public.blob.vercel-storage.com/thumbnails/u1/photo.webp"),
    true
  );
  assert.strictEqual(
    isTrustedImageUrl("https://blob.vercel-storage.com/thumbnails/u1/photo.webp"),
    true
  );
});

test("isTrustedImageUrl: rejects untrusted domains or non-https schemes", () => {
  assert.strictEqual(isTrustedImageUrl("http://abc.public.blob.vercel-storage.com/photo.webp"), false);
  assert.strictEqual(isTrustedImageUrl("https://evil-blob.vercel-storage.com.attacker.com/photo.webp"), false);
  assert.strictEqual(isTrustedImageUrl("https://mywebsite.com/image.jpg"), false);
  assert.strictEqual(isTrustedImageUrl("javascript:alert(1)"), false);
  assert.strictEqual(isTrustedImageUrl(null), false);
  assert.strictEqual(isTrustedImageUrl(undefined), false);
  assert.strictEqual(isTrustedImageUrl(""), false);
});

// 3. Schema rejects client-supplied thumbnail_url
test("BlockSchema & EditBlockSchema: reject client-supplied thumbnail_url or thumbnailUrl", () => {
  const payloadWithUrl = {
    title: "My Portfolio",
    url: "https://example.com",
    thumbnail_url: "https://evil.com/pic.png",
  };
  const res1 = BlockSchema.safeParse(payloadWithUrl);
  assert.strictEqual(res1.success, false, "BlockSchema must reject client thumbnail_url");

  const payloadWithCamel = {
    title: "My Portfolio",
    url: "https://example.com",
    thumbnailUrl: "https://evil.com/pic.png",
  };
  const res2 = BlockSchema.safeParse(payloadWithCamel);
  assert.strictEqual(res2.success, false, "BlockSchema must reject client thumbnailUrl");

  const res3 = EditBlockSchema.safeParse(payloadWithUrl);
  assert.strictEqual(res3.success, false, "EditBlockSchema must reject client thumbnail_url");
});

test("BlockSchema: accepts valid layout, spotlight, and alt text", () => {
  const valid = {
    title: "My Project",
    url: "https://github.com",
    layout: "thumb",
    isHighlighted: true,
    thumbnailAlt: "Screenshot of the project",
  };
  const res = BlockSchema.safeParse(valid);
  assert.strictEqual(res.success, true);
  if (res.success) {
    assert.strictEqual(res.data.layout, "thumb");
    assert.strictEqual(res.data.isHighlighted, true);
    assert.strictEqual(res.data.thumbnailAlt, "Screenshot of the project");
  }
});

// 4. HeaderSchema validation
test("HeaderSchema: validates header title", () => {
  const valid = HeaderSchema.safeParse({ title: "  My Section   Title  " });
  assert.strictEqual(valid.success, true);
  if (valid.success) {
    assert.strictEqual(valid.data.title, "My Section Title");
  }

  const empty = HeaderSchema.safeParse({ title: "   " });
  assert.strictEqual(empty.success, false);

  const tooLong = HeaderSchema.safeParse({ title: "a".repeat(61) });
  assert.strictEqual(tooLong.success, false);
});

// 5. Limits & rules logic
test("Thumbnail limit logic: enforces max 3 photos and allows replacing on the same block", () => {
  const existingBlocksWithImages = [
    { id: "b1", thumbnailUrl: "https://blob.vercel-storage.com/1.webp" },
    { id: "b2", thumbnailUrl: "https://blob.vercel-storage.com/2.webp" },
    { id: "b3", thumbnailUrl: "https://blob.vercel-storage.com/3.webp" },
  ];

  // Helper simulating the upload route query
  function checkCanUpload(targetBlockId: string, blocksList: typeof existingBlocksWithImages): boolean {
    const otherImages = blocksList.filter((b) => b.id !== targetBlockId && Boolean(b.thumbnailUrl));
    return otherImages.length < MAX_THUMBNAILS_PER_PAGE;
  }

  // 4th new block cannot upload image
  assert.strictEqual(checkCanUpload("b4_new", existingBlocksWithImages), false);

  // Replacing existing image on b2 IS allowed at the limit
  assert.strictEqual(checkCanUpload("b2", existingBlocksWithImages), true);
});

test("Spotlight limit logic: allows at most 2 highlighted links", () => {
  const highlightedBlocks = [
    { id: "b1", isHighlighted: true },
    { id: "b2", isHighlighted: true },
  ];

  function checkCanHighlight(targetBlockId: string, list: typeof highlightedBlocks): boolean {
    const otherHighlighted = list.filter((b) => b.id !== targetBlockId && b.isHighlighted);
    return otherHighlighted.length < MAX_HIGHLIGHTED_PER_PAGE;
  }

  // 3rd new block cannot be highlighted
  assert.strictEqual(checkCanHighlight("b3", highlightedBlocks), false);

  // Editing existing highlighted block b1 is allowed
  assert.strictEqual(checkCanHighlight("b1", highlightedBlocks), true);
});

test("Headers limit: enforces maximum 10 headers per page", () => {
  assert.strictEqual(MAX_HEADERS_PER_PAGE, 10);
  assert.strictEqual(MAX_THUMBNAILS_PER_PAGE, 3);
  assert.strictEqual(MAX_HIGHLIGHTED_PER_PAGE, 2);
});
