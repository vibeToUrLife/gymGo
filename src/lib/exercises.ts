import type { Exercise } from "./types";

// Public-domain images from yuhonas/free-exercise-db, served via the jsDelivr CDN.
// Production hardening: mirror these into your own Supabase/R2 bucket (see README).
const IMAGE_BASE =
  "https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises";

export function imageUrl(path: string): string {
  return `${IMAGE_BASE}/${path}`;
}

export type Filters = {
  query: string;
  category: string; // "" = all
  equipment: string;
  muscle: string;
  level: string;
};

export const emptyFilters: Filters = {
  query: "",
  category: "",
  equipment: "",
  muscle: "",
  level: "",
};

export function hasActiveFilters(f: Filters): boolean {
  return Boolean(f.query || f.category || f.equipment || f.muscle || f.level);
}

/** Pure search + filter over the exercise list. */
export function searchAndFilter(list: Exercise[], f: Filters): Exercise[] {
  const q = f.query.trim().toLowerCase();
  return list.filter((ex) => {
    if (q) {
      const haystack = (
        ex.name +
        " " +
        ex.primaryMuscles.join(" ") +
        " " +
        ex.secondaryMuscles.join(" ") +
        " " +
        (ex.equipment ?? "") +
        " " +
        ex.category
      ).toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (f.category && ex.category !== f.category) return false;
    if (f.level && ex.level !== f.level) return false;
    if (f.equipment && ex.equipment !== f.equipment) return false;
    if (
      f.muscle &&
      !ex.primaryMuscles.includes(f.muscle) &&
      !ex.secondaryMuscles.includes(f.muscle)
    ) {
      return false;
    }
    return true;
  });
}

function uniqueSorted(values: Array<string | null | undefined>): string[] {
  return Array.from(
    new Set(values.filter((v): v is string => Boolean(v))),
  ).sort();
}

export type Facets = {
  categories: string[];
  equipment: string[];
  muscles: string[];
  levels: string[];
};

export function facets(list: Exercise[]): Facets {
  return {
    categories: uniqueSorted(list.map((e) => e.category)),
    equipment: uniqueSorted(list.map((e) => e.equipment)),
    muscles: uniqueSorted(list.flatMap((e) => e.primaryMuscles)),
    levels: uniqueSorted(list.map((e) => e.level)),
  };
}
