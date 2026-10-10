import test from "node:test";
import assert from "node:assert";
import { normalizeHex, readableTextOn, readableTextOnBackground, blendColors, getThemeReadabilityIssues } from "./color";
import { DEFAULT_THEME, ThemeConfig } from "./theme";

test("normalizeHex: accepts 3-digit hex with or without # and whitespace", () => {
  assert.strictEqual(normalizeHex("  #fff  "), "#FFFFFF");
  assert.strictEqual(normalizeHex("abc"), "#AABBCC");
  assert.strictEqual(normalizeHex("#123"), "#112233");
});

test("normalizeHex: accepts 6-digit hex with or without # and whitespace", () => {
  assert.strictEqual(normalizeHex("#D4E83A"), "#D4E83A");
  assert.strictEqual(normalizeHex("d4e83a"), "#D4E83A");
  assert.strictEqual(normalizeHex("  #14181f  "), "#14181F");
});

test("normalizeHex: returns null on invalid inputs", () => {
  assert.strictEqual(normalizeHex(""), null);
  assert.strictEqual(normalizeHex("   "), null);
  assert.strictEqual(normalizeHex("blue"), null);
  assert.strictEqual(normalizeHex("#12345"), null);
  assert.strictEqual(normalizeHex("#1234567"), null);
  assert.strictEqual(normalizeHex(null), null);
  assert.strictEqual(normalizeHex(undefined), null);
});

test("readableTextOn: returns high contrast color #14181F or #FFFFFF", () => {
  assert.strictEqual(readableTextOn("#FFFFFF"), "#14181F");
  assert.strictEqual(readableTextOn("#000000"), "#FFFFFF");
  assert.strictEqual(readableTextOn("#D4E83A"), "#14181F"); // Lime bg -> dark text
  assert.strictEqual(readableTextOn("#14181F"), "#FFFFFF"); // Dark ink bg -> light text
});

test("blendColors: blends 18% pattern color over base color", () => {
  // 18% black over pure white: round(255 * 0.82 + 0 * 0.18) = 209 = #D1D1D1
  assert.strictEqual(blendColors("#FFFFFF", "#000000", 0.18), "#D1D1D1");
});

test("getThemeReadabilityIssues: returns empty array for DEFAULT_THEME", () => {
  const issues = getThemeReadabilityIssues(DEFAULT_THEME);
  assert.strictEqual(issues.length, 0);
});

test("getThemeReadabilityIssues: detects error when page text contrast is below 3.0", () => {
  const badPageTheme: ThemeConfig = {
    ...DEFAULT_THEME,
    background: { type: "solid", value: "#000000" },
    textColor: "#111111", // Black on black -> ratio < 3.0
  };
  const issues = getThemeReadabilityIssues(badPageTheme);
  assert.strictEqual(issues.length, 1);
  assert.strictEqual(issues[0].pair, "page");
  assert.strictEqual(issues[0].level, "error");
  assert.ok(issues[0].message.includes("page text is too hard to read"));
});

test("getThemeReadabilityIssues: detects error when button text contrast is below 3.0", () => {
  const badButtonTheme: ThemeConfig = {
    ...DEFAULT_THEME,
    button: {
      shape: "pill",
      style: "solid",
      fill: "#FFFFFF",
      textColor: "#EEEEEE", // White text on white fill
    },
  };
  const issues = getThemeReadabilityIssues(badButtonTheme);
  const buttonIssue = issues.find((i) => i.pair === "button");
  assert.ok(buttonIssue);
  assert.strictEqual(buttonIssue?.level, "error");
  assert.ok(buttonIssue?.message.includes("button text is too hard to read"));
});

test("getThemeReadabilityIssues: detects warning when contrast is between 3.0 and 4.5 (allowed to save)", () => {
  const warningTheme: ThemeConfig = {
    ...DEFAULT_THEME,
    background: { type: "solid", value: "#FFFFFF" },
    textColor: "#888888", // Contrast ~3.5:1 -> warning
  };
  const issues = getThemeReadabilityIssues(warningTheme);
  assert.strictEqual(issues.length, 1);
  assert.strictEqual(issues[0].pair, "page");
  assert.strictEqual(issues[0].level, "warning");
  assert.strictEqual(issues.some((i) => i.level === "error"), false);
});

test("getThemeReadabilityIssues: checks button text against page background for outline style", () => {
  const outlineTheme: ThemeConfig = {
    ...DEFAULT_THEME,
    background: { type: "solid", value: "#000000" },
    button: {
      shape: "pill",
      style: "outline",
      fill: "#FFFFFF", // Border
      textColor: "#111111", // Text on black bg -> ratio < 3.0 error
    },
  };
  const issues = getThemeReadabilityIssues(outlineTheme);
  const buttonIssue = issues.find((i) => i.pair === "button");
  assert.ok(buttonIssue);
  assert.strictEqual(buttonIssue?.level, "error");
  assert.ok(buttonIssue?.message.includes("background color"));
});

test("getThemeReadabilityIssues: gradient checks text against both color stops and reports worse ratio", () => {
  // Gradient from white to black with white text -> worse ratio is 1:1 on the white stop
  const badGradientTheme: ThemeConfig = {
    ...DEFAULT_THEME,
    background: {
      type: "gradient",
      from: "#FFFFFF",
      to: "#000000",
      direction: "diagonal",
    },
    textColor: "#FFFFFF",
  };
  const issues = getThemeReadabilityIssues(badGradientTheme);
  const pageIssue = issues.find((i) => i.pair === "page");
  assert.ok(pageIssue);
  assert.strictEqual(pageIssue?.level, "error");
  assert.strictEqual(pageIssue?.ratio, 1);
});

test("getThemeReadabilityIssues: pattern checks text against base and 18% blended color", () => {
  // Pattern with base #FFFFFF, pattern color #FFFFFF, text #FFFFFF -> worse ratio is 1:1
  const badPatternTheme: ThemeConfig = {
    ...DEFAULT_THEME,
    background: {
      type: "pattern",
      base: "#FFFFFF",
      color: "#FFFFFF",
      kind: "dots",
      size: "medium",
    },
    textColor: "#FFFFFF",
  };
  const issues = getThemeReadabilityIssues(badPatternTheme);
  const pageIssue = issues.find((i) => i.pair === "page");
  assert.ok(pageIssue);
  assert.strictEqual(pageIssue?.level, "error");
});

test("readableTextOnBackground: returns readable text for gradients and patterns", () => {
  const sunriseBg = {
    type: "gradient" as const,
    from: "#FFD84D",
    to: "#FF5A36",
    direction: "diagonal" as const,
  };
  assert.strictEqual(readableTextOnBackground(sunriseBg), "#14181F");

  const darkPatternBg = {
    type: "pattern" as const,
    base: "#14181F",
    color: "#FFFFFF",
    kind: "dots" as const,
    size: "medium" as const,
  };
  assert.strictEqual(readableTextOnBackground(darkPatternBg), "#FFFFFF");
});
