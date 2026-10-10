import test from "node:test";
import assert from "node:assert";
import { contrastRatio, relativeLuminance } from "./contrast";
import { backgroundContrastRatio } from "./color";
import { THEME_PRESETS } from "./theme-presets";

test("contrastRatio: black on white gives 21", () => {
  const ratio = contrastRatio("#000000", "#FFFFFF");
  assert.strictEqual(Math.round(ratio), 21);
});

test("contrastRatio: identical colors gives 1", () => {
  const ratio = contrastRatio("#FFFFFF", "#FFFFFF");
  assert.strictEqual(ratio, 1);
});

test("relativeLuminance: correctly handles 3-digit and 6-digit hex", () => {
  assert.strictEqual(relativeLuminance("#FFF"), relativeLuminance("#FFFFFF"));
  assert.strictEqual(relativeLuminance("#000"), relativeLuminance("#000000"));
});

test("All 14 theme presets pass WCAG AA contrast ratio (>= 4.5:1)", () => {
  assert.strictEqual(THEME_PRESETS.length, 14);

  for (const preset of THEME_PRESETS) {
    const { name, theme } = preset;
    
    // 1. Page text vs Page background >= 4.5:1
    const pageTextContrast = backgroundContrastRatio(theme.textColor, theme.background);
    assert.ok(
      pageTextContrast >= 4.5,
      `[${name}] Page text (${theme.textColor}) vs bg contrast was ${pageTextContrast.toFixed(2)}, expected >= 4.5`
    );

    // 2. Button text vs background / fill >= 4.5:1
    if (theme.button.style === "outline") {
      // For outline, button text sits on the PAGE background
      const outlineTextContrast = backgroundContrastRatio(theme.button.textColor, theme.background);
      assert.ok(
        outlineTextContrast >= 4.5,
        `[${name}] Outline button text (${theme.button.textColor}) vs bg contrast was ${outlineTextContrast.toFixed(2)}, expected >= 4.5`
      );
    } else {
      // For solid and hard-shadow, button text sits on button fill
      const buttonFillContrast = contrastRatio(theme.button.textColor, theme.button.fill);
      assert.ok(
        buttonFillContrast >= 4.5,
        `[${name}] Button text (${theme.button.textColor}) vs fill (${theme.button.fill}) contrast was ${buttonFillContrast.toFixed(2)}, expected >= 4.5`
      );
    }
  }
});
