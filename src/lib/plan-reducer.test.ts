import { test } from "node:test";
import assert from "node:assert/strict";
import {
  planReducer,
  emptyWeek,
  normalizeWeek,
  mergeWeek,
  weekCount,
  DAYS,
} from "./plan-reducer.ts";

test("emptyWeek has all seven days empty", () => {
  const w = emptyWeek();
  assert.deepEqual(Object.keys(w), [...DAYS]);
  assert.equal(weekCount(w), 0);
});

test("add appends to the given day and de-dupes within a day", () => {
  let w = emptyWeek();
  w = planReducer(w, { type: "add", day: "mon", id: "a" });
  w = planReducer(w, { type: "add", day: "mon", id: "b" });
  w = planReducer(w, { type: "add", day: "mon", id: "a" });
  assert.deepEqual(w.mon, ["a", "b"]);
});

test("same exercise may appear on different days", () => {
  let w = emptyWeek();
  w = planReducer(w, { type: "add", day: "mon", id: "squat" });
  w = planReducer(w, { type: "add", day: "thu", id: "squat" });
  assert.deepEqual(w.mon, ["squat"]);
  assert.deepEqual(w.thu, ["squat"]);
  assert.equal(weekCount(w), 2);
});

test("remove only affects the named day", () => {
  let w = emptyWeek();
  w = planReducer(w, { type: "add", day: "mon", id: "a" });
  w = planReducer(w, { type: "add", day: "tue", id: "a" });
  w = planReducer(w, { type: "remove", day: "mon", id: "a" });
  assert.deepEqual(w.mon, []);
  assert.deepEqual(w.tue, ["a"]);
});

test("move reorders within a day only", () => {
  let w = emptyWeek();
  ["a", "b", "c"].forEach((id) => (w = planReducer(w, { type: "add", day: "wed", id })));
  w = planReducer(w, { type: "move", day: "wed", from: 0, to: 2 });
  assert.deepEqual(w.wed, ["b", "c", "a"]);
});

test("move is a no-op for out-of-range or equal indices", () => {
  let w = emptyWeek();
  ["a", "b"].forEach((id) => (w = planReducer(w, { type: "add", day: "fri", id })));
  assert.equal(planReducer(w, { type: "move", day: "fri", from: 0, to: 0 }), w);
  assert.equal(planReducer(w, { type: "move", day: "fri", from: 5, to: 0 }), w);
});

test("clearDay empties one day, clear empties all", () => {
  let w = emptyWeek();
  w = planReducer(w, { type: "add", day: "mon", id: "a" });
  w = planReducer(w, { type: "add", day: "tue", id: "b" });
  const cleared = planReducer(w, { type: "clearDay", day: "mon" });
  assert.deepEqual(cleared.mon, []);
  assert.deepEqual(cleared.tue, ["b"]);
  assert.equal(weekCount(planReducer(w, { type: "clear" })), 0);
});

test("hydrate migrates a legacy flat array onto Monday", () => {
  const w = planReducer(emptyWeek(), { type: "hydrate", plan: ["a", "b", "a"] });
  assert.deepEqual(w.mon, ["a", "b"]);
  assert.equal(weekCount(w), 2);
});

test("hydrate accepts a partial week object and ignores junk", () => {
  const w = planReducer(emptyWeek(), {
    type: "hydrate",
    plan: { mon: ["a"], fri: ["b", 3, null, "b"], bogus: ["x"] },
  });
  assert.deepEqual(w.mon, ["a"]);
  assert.deepEqual(w.fri, ["b"]);
  assert.deepEqual(w.sun, []);
});

test("normalizeWeek is robust to null/garbage", () => {
  assert.equal(weekCount(normalizeWeek(null)), 0);
  assert.equal(weekCount(normalizeWeek(42)), 0);
  assert.equal(weekCount(normalizeWeek("nope")), 0);
});

test("reducer never mutates its input", () => {
  const w = emptyWeek();
  planReducer(w, { type: "add", day: "mon", id: "a" });
  assert.deepEqual(w.mon, []);
});

test("mergeWeek unions per day, remote first then local extras, de-duped", () => {
  const remote = { mon: ["a", "b"], tue: ["x"] };
  const local = { mon: ["b", "c"], wed: ["y"] };
  const m = mergeWeek(remote, local);
  assert.deepEqual(m.mon, ["a", "b", "c"]);
  assert.deepEqual(m.tue, ["x"]);
  assert.deepEqual(m.wed, ["y"]);
  assert.equal(weekCount(m), 5);
});

test("mergeWeek handles an empty side (nothing lost)", () => {
  const local = { mon: ["a"], sun: ["z"] };
  assert.deepEqual(mergeWeek(null, local), normalizeWeek(local));
  assert.deepEqual(mergeWeek(local, {}), normalizeWeek(local));
});

test("mergeWeek coerces junk on either side", () => {
  const m = mergeWeek({ mon: ["a", 2, null] }, "garbage");
  assert.deepEqual(m.mon, ["a"]);
  assert.equal(weekCount(m), 1);
});
