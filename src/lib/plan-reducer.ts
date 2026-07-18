// Pure weekly-plan reducer (no React) so it can be unit-tested directly.
// The plan is a training split: each weekday holds an ordered list of exercise ids.

export const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
export type Day = (typeof DAYS)[number];
export type WeekPlan = Record<Day, string[]>;

export function emptyWeek(): WeekPlan {
  return { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] };
}

export type PlanAction =
  | { type: "add"; day: Day; id: string }
  | { type: "remove"; day: Day; id: string }
  | { type: "move"; day: Day; from: number; to: number }
  | { type: "clearDay"; day: Day }
  | { type: "clear" }
  | { type: "hydrate"; plan: unknown };

export function planReducer(state: WeekPlan, action: PlanAction): WeekPlan {
  switch (action.type) {
    case "add": {
      const list = state[action.day];
      // An exercise may repeat across days, but not twice within one day.
      if (list.includes(action.id)) return state;
      return { ...state, [action.day]: [...list, action.id] };
    }
    case "remove":
      return {
        ...state,
        [action.day]: state[action.day].filter((id) => id !== action.id),
      };
    case "move": {
      const { day, from, to } = action;
      const list = state[day];
      if (
        from < 0 ||
        to < 0 ||
        from >= list.length ||
        to >= list.length ||
        from === to
      ) {
        return state;
      }
      const next = list.slice();
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return { ...state, [day]: next };
    }
    case "clearDay":
      return state[action.day].length === 0
        ? state
        : { ...state, [action.day]: [] };
    case "clear":
      return emptyWeek();
    case "hydrate":
      return normalizeWeek(action.plan);
    default:
      return state;
  }
}

function dedupeStrings(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return Array.from(new Set(v.filter((x): x is string => typeof x === "string")));
}

/**
 * Coerces persisted/legacy data into a valid WeekPlan.
 * A legacy flat array (the pre-weekly plan) is migrated onto Monday.
 */
export function normalizeWeek(input: unknown): WeekPlan {
  const week = emptyWeek();
  if (Array.isArray(input)) {
    week.mon = dedupeStrings(input);
    return week;
  }
  if (input && typeof input === "object") {
    for (const day of DAYS) {
      week[day] = dedupeStrings((input as Record<string, unknown>)[day]);
    }
  }
  return week;
}

export function weekCount(plan: WeekPlan): number {
  return DAYS.reduce((n, d) => n + plan[d].length, 0);
}

/**
 * Merges two week plans without losing anything: for each day, the union of the
 * remote ids followed by any local ids not already present, de-duplicated and
 * order-preserving. Used when a guest signs in so their local plan and the plan
 * saved on their account combine instead of one overwriting the other.
 */
export function mergeWeek(remote: unknown, local: unknown): WeekPlan {
  const r = normalizeWeek(remote);
  const l = normalizeWeek(local);
  const week = emptyWeek();
  for (const day of DAYS) {
    week[day] = Array.from(new Set([...r[day], ...l[day]]));
  }
  return week;
}
