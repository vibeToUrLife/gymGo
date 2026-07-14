import { test } from "node:test";
import assert from "node:assert/strict";
import {
  searchAndFilter,
  facets,
  imageUrl,
  hasActiveFilters,
  emptyFilters,
} from "./exercises.ts";
import type { Exercise } from "./types.ts";

function ex(partial: Partial<Exercise> & { id: string; name: string }): Exercise {
  return {
    force: null,
    level: "beginner",
    mechanic: null,
    equipment: null,
    primaryMuscles: [],
    secondaryMuscles: [],
    instructions: [],
    category: "strength",
    images: [],
    ...partial,
  };
}

const list: Exercise[] = [
  ex({ id: "a", name: "Barbell Squat", primaryMuscles: ["quadriceps"], secondaryMuscles: ["glutes"], equipment: "barbell", level: "intermediate", category: "strength" }),
  ex({ id: "b", name: "Push Up", primaryMuscles: ["chest"], secondaryMuscles: ["triceps"], equipment: "body only", level: "beginner", category: "strength" }),
  ex({ id: "c", name: "Standing Calf Raise", primaryMuscles: ["calves"], equipment: "machine", level: "beginner", category: "strength" }),
  ex({ id: "d", name: "Cobra Stretch", primaryMuscles: ["abdominals"], equipment: "body only", level: "beginner", category: "stretching" }),
];

test("empty filters return the whole list", () => {
  assert.equal(searchAndFilter(list, emptyFilters).length, 4);
});

test("query matches name (case-insensitive)", () => {
  const r = searchAndFilter(list, { ...emptyFilters, query: "squat" });
  assert.deepEqual(r.map((e) => e.id), ["a"]);
});

test("query matches muscle and equipment too", () => {
  assert.deepEqual(searchAndFilter(list, { ...emptyFilters, query: "chest" }).map((e) => e.id), ["b"]);
  assert.deepEqual(searchAndFilter(list, { ...emptyFilters, query: "machine" }).map((e) => e.id), ["c"]);
});

test("category filter", () => {
  assert.deepEqual(searchAndFilter(list, { ...emptyFilters, category: "stretching" }).map((e) => e.id), ["d"]);
});

test("muscle filter matches primary OR secondary", () => {
  assert.deepEqual(searchAndFilter(list, { ...emptyFilters, muscle: "glutes" }).map((e) => e.id), ["a"]);
});

test("equipment + level filters compose", () => {
  const r = searchAndFilter(list, { ...emptyFilters, equipment: "body only", level: "beginner" });
  assert.deepEqual(r.map((e) => e.id).sort(), ["b", "d"]);
});

test("filters that match nothing return empty", () => {
  assert.equal(searchAndFilter(list, { ...emptyFilters, query: "zzzzz" }).length, 0);
});

test("facets are unique and sorted", () => {
  const f = facets(list);
  assert.deepEqual(f.categories, ["strength", "stretching"]);
  assert.deepEqual(f.levels, ["beginner", "intermediate"]);
  assert.ok(f.muscles.includes("quadriceps"));
  assert.deepEqual(f.equipment, ["barbell", "body only", "machine"]);
});

test("imageUrl builds a jsDelivr CDN url", () => {
  assert.equal(
    imageUrl("Push_Up/0.jpg"),
    "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Push_Up/0.jpg",
  );
});

test("hasActiveFilters reflects state", () => {
  assert.equal(hasActiveFilters(emptyFilters), false);
  assert.equal(hasActiveFilters({ ...emptyFilters, query: "x" }), true);
});
