import test from "node:test";
import assert from "node:assert";
import { validateReorder, validateGroupedReorder } from "./blocks";

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

// Grouped reordering tests
test("validateGroupedReorder: succeeds for exact set within group", () => {
  const existing = [
    { id: "l1", type: "link" },
    { id: "l2", type: "link" },
    { id: "s1", type: "social" },
  ];
  const result = validateGroupedReorder(existing, "link", ["l2", "l1"]);
  assert.strictEqual(result.ok, true);

  const socialResult = validateGroupedReorder(existing, "social", ["s1"]);
  assert.strictEqual(socialResult.ok, true);
});

test("validateGroupedReorder: fails on wrong group (passing a social id to link group)", () => {
  const existing = [
    { id: "l1", type: "link" },
    { id: "s1", type: "social" },
  ];
  const result = validateGroupedReorder(existing, "link", ["s1"]);
  assert.strictEqual(result.ok, false);
  if (!result.ok) {
    assert.strictEqual(result.code, "wrong_group");
  }
});

test("validateGroupedReorder: fails on foreign id (not belonging to page)", () => {
  const existing = [
    { id: "l1", type: "link" },
    { id: "l2", type: "link" },
  ];
  const result = validateGroupedReorder(existing, "link", ["l1", "foreign-id"]);
  assert.strictEqual(result.ok, false);
});

test("validateGroupedReorder: fails on duplicates", () => {
  const existing = [
    { id: "s1", type: "social" },
    { id: "s2", type: "social" },
  ];
  const result = validateGroupedReorder(existing, "social", ["s1", "s1"]);
  assert.strictEqual(result.ok, false);
});

test("validateGroupedReorder: fails on missing ids from group", () => {
  const existing = [
    { id: "s1", type: "social" },
    { id: "s2", type: "social" },
  ];
  const result = validateGroupedReorder(existing, "social", ["s1"]);
  assert.strictEqual(result.ok, false);
});

