import test from "node:test";
import assert from "node:assert";
import {
  resolveTheme,
  DEFAULT_THEME,
  DEFAULT_LAYOUT,
  ThemeSchema,
  getThemeBackgroundStyle,
} from "./theme";

test("resolveTheme: returns DEFAULT_THEME for empty object", () => {
  const result = resolveTheme({});
  assert.deepStrictEqual(result, DEFAULT_THEME);
});

test("resolveTheme: returns DEFAULT_THEME for null", () => {
  const result = resolveTheme(null);
  assert.deepStrictEqual(result, DEFAULT_THEME);
});

test("resolveTheme: returns DEFAULT_THEME for undefined", () => {
  const result = resolveTheme(undefined);
  assert.deepStrictEqual(result, DEFAULT_THEME);
});

test("resolveTheme: returns DEFAULT_THEME for invalid hex", () => {
  const invalidTheme = {
    ...DEFAULT_THEME,
    textColor: "red", // invalid hex
  };
  const result = resolveTheme(invalidTheme);
  assert.deepStrictEqual(result, DEFAULT_THEME);
});

test("ThemeSchema: rejects unknown key (strict schema)", () => {
  const validThemeWithExtra = {
    ...DEFAULT_THEME,
    extraField: "hello",
  };
  const result = ThemeSchema.safeParse(validThemeWithExtra);
  assert.strictEqual(result.success, false);
});

test("ThemeSchema: rejects unknown key in button", () => {
  const validThemeWithExtraButton = {
    ...DEFAULT_THEME,
    button: {
      ...DEFAULT_THEME.button,
      extraButtonProp: "not-allowed",
    },
  };
  const result = ThemeSchema.safeParse(validThemeWithExtraButton);
  assert.strictEqual(result.success, false);
});

test("ThemeSchema: rejects invalid hex color strings", () => {
  assert.strictEqual(
    ThemeSchema.safeParse({
      ...DEFAULT_THEME,
      textColor: "#12345", // only 5 chars
    }).success,
    false
  );
  assert.strictEqual(
    ThemeSchema.safeParse({
      ...DEFAULT_THEME,
      textColor: "blue",
    }).success,
    false
  );
  assert.strictEqual(
    ThemeSchema.safeParse({
      ...DEFAULT_THEME,
      button: {
        ...DEFAULT_THEME.button,
        fill: "rgb(255, 0, 0)",
      },
    }).success,
    false
  );
});

test("ThemeSchema: parses old theme without layout and defaults layout properties", () => {
  const oldThemeWithoutLayout = {
    background: { type: "solid", value: "#D4E83A" },
    textColor: "#1F4D1A",
    button: {
      shape: "pill",
      style: "solid",
      fill: "#FFFFFF",
      textColor: "#14181F",
    },
    font: "bricolage",
  };
  const parsed = ThemeSchema.safeParse(oldThemeWithoutLayout);
  assert.strictEqual(parsed.success, true);
  if (parsed.success) {
    assert.deepStrictEqual(parsed.data.layout, DEFAULT_LAYOUT);
  }
});

test("resolveTheme: backwards-compatible with old theme without layout and without button.style", () => {
  const oldTheme = {
    background: { type: "solid", value: "#D4E83A" },
    textColor: "#1F4D1A",
    button: {
      shape: "pill",
      fill: "#FFFFFF",
      textColor: "#14181F",
    },
    font: "bricolage",
  };
  const result = resolveTheme(oldTheme);
  assert.deepStrictEqual(result, DEFAULT_THEME);
});

test("ThemeSchema: parses gradient background", () => {
  const gradientTheme = {
    ...DEFAULT_THEME,
    background: {
      type: "gradient",
      from: "#FFD84D",
      to: "#FF5A36",
      direction: "diagonal",
    },
  };
  const parsed = ThemeSchema.safeParse(gradientTheme);
  assert.strictEqual(parsed.success, true);
  if (parsed.success) {
    assert.strictEqual(parsed.data.background.type, "gradient");
  }
});

test("ThemeSchema: parses pattern background", () => {
  const patternTheme = {
    ...DEFAULT_THEME,
    background: {
      type: "pattern",
      base: "#BFEBD6",
      color: "#0F3D2E",
      kind: "dots",
      size: "medium",
    },
  };
  const parsed = ThemeSchema.safeParse(patternTheme);
  assert.strictEqual(parsed.success, true);
  if (parsed.success) {
    assert.strictEqual(parsed.data.background.type, "pattern");
  }
});

test("getThemeBackgroundStyle: produces correct CSS styles", () => {
  const solidStyle = getThemeBackgroundStyle({ type: "solid", value: "#D4E83A" });
  assert.strictEqual(solidStyle.backgroundColor, "#D4E83A");

  const gradientStyle = getThemeBackgroundStyle({
    type: "gradient",
    from: "#FFD84D",
    to: "#FF5A36",
    direction: "diagonal",
  });
  assert.ok(gradientStyle.backgroundImage?.includes("135deg"));

  const patternStyle = getThemeBackgroundStyle({
    type: "pattern",
    base: "#BFEBD6",
    color: "#0F3D2E",
    kind: "dots",
    size: "medium",
  });
  assert.strictEqual(patternStyle.backgroundColor, "#BFEBD6");
  assert.ok(patternStyle.backgroundImage?.includes("radial-gradient"));
  assert.strictEqual(patternStyle.backgroundSize, "28px 28px");
});
