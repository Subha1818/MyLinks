import test from "node:test";
import assert from "node:assert";
import {
  buildWhatsAppShareUrl,
  buildXShareUrl,
  buildTelegramShareUrl,
  buildEmailShareUrl,
  QR_COLOR_PRESETS,
} from "./share";
import { contrastRatio } from "./contrast";

test("buildWhatsAppShareUrl: correctly encodes text and url", () => {
  const url = "https://mylinkz.vercel.app/alex";
  const shareUrl = buildWhatsAppShareUrl({
    url,
    text: "Check out my new page!",
  });
  assert.strictEqual(
    shareUrl,
    "https://wa.me/?text=Check%20out%20my%20new%20page!%20https%3A%2F%2Fmylinkz.vercel.app%2Falex"
  );
});

test("buildWhatsAppShareUrl: handles url-only options", () => {
  const url = "https://mylinkz.vercel.app/elena";
  const shareUrl = buildWhatsAppShareUrl({ url });
  assert.strictEqual(
    shareUrl,
    "https://wa.me/?text=https%3A%2F%2Fmylinkz.vercel.app%2Felena"
  );
});

test("buildXShareUrl: constructs valid X intent parameters", () => {
  const url = "https://mylinkz.vercel.app/creator";
  const shareUrl = buildXShareUrl({
    url,
    text: "My creative portfolio & links",
  });
  assert.ok(shareUrl.startsWith("https://x.com/intent/post?"));
  assert.ok(shareUrl.includes("url=https%3A%2F%2Fmylinkz.vercel.app%2Fcreator"));
  assert.ok(shareUrl.includes("text=My+creative+portfolio+%26+links"));
});

test("buildTelegramShareUrl: constructs valid Telegram share parameters", () => {
  const url = "https://mylinkz.vercel.app/dev";
  const shareUrl = buildTelegramShareUrl({
    url,
    text: "Explore my links",
  });
  assert.ok(shareUrl.startsWith("https://t.me/share/url?"));
  assert.ok(shareUrl.includes("url=https%3A%2F%2Fmylinkz.vercel.app%2Fdev"));
  assert.ok(shareUrl.includes("text=Explore+my+links"));
});

test("buildEmailShareUrl: encodes mailto subject and body", () => {
  const url = "https://mylinkz.vercel.app/designer";
  const shareUrl = buildEmailShareUrl({
    url,
    title: "Elena's Links",
    text: "Here is my profile on MyLinks",
  });
  assert.ok(shareUrl.startsWith("mailto:?"));
  assert.ok(shareUrl.includes("subject=Elena's%20Links"));
  assert.ok(shareUrl.includes("body=Here%20is%20my%20profile%20on%20MyLinks%0A%0Ahttps%3A%2F%2Fmylinkz.vercel.app%2Fdesigner"));
});

test("All 5 QR color presets pass scannability contrast check (>= 7:1 against white)", () => {
  assert.strictEqual(QR_COLOR_PRESETS.length, 5);
  for (const preset of QR_COLOR_PRESETS) {
    const ratio = contrastRatio(preset.hex, "#FFFFFF");
    assert.ok(
      ratio >= 7.0,
      `[${preset.label}] ${preset.hex} contrast against #FFFFFF was ${ratio.toFixed(2)}, expected >= 7.0`
    );
  }
});
