import { test } from "node:test";
import assert from "node:assert/strict";
import { planReducer } from "./plan-reducer.ts";

test("add appends new ids and ignores duplicates", () => {
  let s: string[] = [];
  s = planReducer(s, { type: "add", id: "a" });
  s = planReducer(s, { type: "add", id: "b" });
  s = planReducer(s, { type: "add", id: "a" });
  assert.deepEqual(s, ["a", "b"]);
});

test("remove deletes an id", () => {
  assert.deepEqual(planReducer(["a", "b", "c"], { type: "remove", id: "b" }), ["a", "c"]);
});

test("move reorders items", () => {
  assert.deepEqual(planReducer(["a", "b", "c"], { type: "move", from: 0, to: 2 }), ["b", "c", "a"]);
  assert.deepEqual(planReducer(["a", "b", "c"], { type: "move", from: 2, to: 0 }), ["c", "a", "b"]);
});

test("move is a no-op for out-of-range or equal indices", () => {
  const s = ["a", "b", "c"];
  assert.equal(planReducer(s, { type: "move", from: 1, to: 1 }), s);
  assert.equal(planReducer(s, { type: "move", from: -1, to: 0 }), s);
  assert.equal(planReducer(s, { type: "move", from: 0, to: 9 }), s);
});

test("clear empties the plan", () => {
  assert.deepEqual(planReducer(["a", "b"], { type: "clear" }), []);
});

test("hydrate replaces state and de-dupes", () => {
  assert.deepEqual(planReducer(["x"], { type: "hydrate", ids: ["a", "b", "a", "c"] }), ["a", "b", "c"]);
});

test("reducer never mutates its input", () => {
  const s = ["a", "b"];
  planReducer(s, { type: "add", id: "c" });
  planReducer(s, { type: "move", from: 0, to: 1 });
  assert.deepEqual(s, ["a", "b"]);
});
