import test from "node:test";
import assert from "node:assert";
import { resolveTheme, DEFAULT_THEME, ThemeConfig } from "./theme";

test("resolveTheme: returns DEFAULT_THEME for empty object", () => {
  const result = resolveTheme({});
  assert.deepStrictEqual(result, DEFAULT_THEME);
});

test("resolveTheme: returns DEFAULT_THEME for null", () => {
  const result = resolveTheme(null);
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

test("resolveTheme: returns DEFAULT_THEME for extra fields (zod strips or fails depending on strict, but safeParse strips by default, wait, if it fails, it returns DEFAULT)", () => {
  // Actually Zod object defaults to `strip` for extra fields, so it will succeed and strip it.
  const validThemeWithExtra = {
    ...DEFAULT_THEME,
    extraField: "hello",
  };
  const result = resolveTheme(validThemeWithExtra);
  assert.deepStrictEqual(result, DEFAULT_THEME); // wait, safeParse strips it, so it returns the parsed object without extraField, which equals DEFAULT_THEME
});

test("resolveTheme: correctly parses valid theme", () => {
  const validTheme: ThemeConfig = {
    background: { type: "solid", value: "#000000" },
    textColor: "#FFFFFF",
    button: {
      shape: "square",
      fill: "#111111",
      textColor: "#EEEEEE",
    },
    font: "dm-sans",
  };
  const result = resolveTheme(validTheme);
  assert.deepStrictEqual(result, validTheme);
});
