import test from "node:test";
import assert from "node:assert";
import { normalizeHex, readableTextOn, getThemeReadabilityIssues } from "./color";
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
