import test from "node:test";
import assert from "node:assert";
import { resolveTheme, DEFAULT_THEME, ThemeConfig, ThemeSchema } from "./theme";

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

test("ThemeSchema: parses old theme without button.style and defaults to solid", () => {
  const oldThemeWithoutStyle = {
    background: { type: "solid", value: "#D4E83A" },
    textColor: "#1F4D1A",
    button: {
      shape: "pill",
      fill: "#FFFFFF",
      textColor: "#14181F",
    },
    font: "bricolage",
  };
  const parsed = ThemeSchema.safeParse(oldThemeWithoutStyle);
  assert.strictEqual(parsed.success, true);
  if (parsed.success) {
    assert.strictEqual(parsed.data.button.style, "solid");
  }
});

test("resolveTheme: backwards-compatible with old theme without button.style", () => {
  const oldThemeWithoutStyle = {
    background: { type: "solid", value: "#D4E83A" },
    textColor: "#1F4D1A",
    button: {
      shape: "pill",
      fill: "#FFFFFF",
      textColor: "#14181F",
    },
    font: "bricolage",
  };
  const result = resolveTheme(oldThemeWithoutStyle);
  assert.deepStrictEqual(result, DEFAULT_THEME);
});

test("resolveTheme: correctly parses valid theme with all properties", () => {
  const validTheme: ThemeConfig = {
    background: { type: "solid", value: "#000000" },
    textColor: "#FFFFFF",
    button: {
      shape: "square",
      style: "hard-shadow",
      fill: "#111111",
      textColor: "#EEEEEE",
    },
    font: "dm-sans",
  };
  const result = resolveTheme(validTheme);
  assert.deepStrictEqual(result, validTheme);
});
