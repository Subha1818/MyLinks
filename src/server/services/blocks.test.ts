import test from "node:test";
import assert from "node:assert";
import { validateReorder } from "./blocks";

test("validateReorder: exact-set check succeeds", () => {
  const result = validateReorder(["a", "b", "c"], ["c", "a", "b"]);
  assert.strictEqual(result.ok, true);
});

test("validateReorder: fails on missing id", () => {
  const result = validateReorder(["a", "b", "c"], ["a", "b"]);
  assert.strictEqual(result.ok, false);
  if (!result.ok) {
    assert.strictEqual(result.code, "stale");
  }
});

test("validateReorder: fails on extra id", () => {
  const result = validateReorder(["a", "b"], ["a", "b", "c"]);
  assert.strictEqual(result.ok, false);
});

test("validateReorder: fails on foreign id", () => {
  const result = validateReorder(["a", "b"], ["a", "c"]);
  assert.strictEqual(result.ok, false);
});

test("validateReorder: fails on duplicate ids when counts mismatch", () => {
  // same length but duplicates
  const result = validateReorder(["a", "b", "c"], ["a", "b", "b"]);
  assert.strictEqual(result.ok, false);
});

test("validateReorder: empty lists succeed", () => {
  const result = validateReorder([], []);
  assert.strictEqual(result.ok, true);
});
