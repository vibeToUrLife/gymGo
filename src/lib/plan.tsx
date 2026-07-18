"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  planReducer,
  emptyWeek,
  weekCount,
  mergeWeek,
  DAYS,
  type Day,
  type WeekPlan,
} from "./plan-reducer";
import { useAuth } from "./auth";
import { supabase } from "./supabase";

const PLAN_KEY = "gymgo-week";
const LEGACY_KEY = "gymgo-plan"; // pre-weekly flat array
const ACTIVE_KEY = "gymgo-active-day";

function isDay(v: unknown): v is Day {
  return typeof v === "string" && (DAYS as readonly string[]).includes(v);
}

type PlanContextValue = {
  plan: WeekPlan;
  activeDay: Day;
  setActiveDay: (day: Day) => void;
  count: number; // total across the whole week
  countForDay: (day: Day) => number;
  /** Is this exercise on the ACTIVE day? (drives Browse "In plan" state) */
  has: (id: string) => boolean;
  /** Is this exercise on ANY day? */
  hasOnAnyDay: (id: string) => boolean;
  add: (id: string) => void; // -> active day
  addTo: (day: Day, id: string) => void;
  remove: (day: Day, id: string) => void;
  toggle: (id: string) => void; // toggle on active day
  move: (day: Day, from: number, to: number) => void;
  clearDay: (day: Day) => void;
  clear: () => void;
};

const PlanContext = createContext<PlanContextValue | null>(null);

export function PlanProvider({ children }: { children: ReactNode }) {
  const [plan, dispatch] = useReducer(planReducer, undefined, emptyWeek);
  const [activeDay, setActiveDayState] = useState<Day>("mon");
  const [hydrated, setHydrated] = useState(false);

  const { user } = useAuth();
  const userId = user?.id ?? null;
  // Latest plan, readable inside async callbacks without a stale closure.
  const planRef = useRef(plan);
  planRef.current = plan;
  // The user id whose account plan we've already merged in this session.
  const syncedUserRef = useRef<string | null>(null);

  // Load persisted plan + active day once (migrating the legacy flat plan).
  useEffect(() => {
    try {
      const rawWeek = localStorage.getItem(PLAN_KEY);
      const rawLegacy = rawWeek ? null : localStorage.getItem(LEGACY_KEY);
      const raw = rawWeek ?? rawLegacy;
      if (raw) dispatch({ type: "hydrate", plan: JSON.parse(raw) });
      if (rawLegacy) localStorage.removeItem(LEGACY_KEY);

      const savedDay = localStorage.getItem(ACTIVE_KEY);
      if (isDay(savedDay)) setActiveDayState(savedDay);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  // Persist after hydration so first paint never clobbers saved data.
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(PLAN_KEY, JSON.stringify(plan));
    } catch {
      /* ignore */
    }
  }, [plan, hydrated]);

  // Sign-in / sign-out sync. On sign-in: merge the local (guest) plan with the
  // account plan so nothing is lost, then treat the account as source of truth.
  // On sign-out: clear the local plan so one user's data can't leak into the
  // next person's session on a shared browser (their data is safe server-side).
  useEffect(() => {
    if (!hydrated || !supabase) return;

    if (!userId) {
      if (syncedUserRef.current) {
        syncedUserRef.current = null;
        dispatch({ type: "clear" });
        try {
          localStorage.removeItem(PLAN_KEY);
        } catch {
          /* ignore */
        }
      }
      return;
    }

    if (userId === syncedUserRef.current) return;

    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase
          .from("plans")
          .select("week")
          .eq("user_id", userId)
          .maybeSingle();
        if (cancelled) return;
        if (error) {
          // Keep the local view; don't overwrite the remote we couldn't read.
          console.warn("[gymgo] could not load account plan:", error.message);
          syncedUserRef.current = userId;
          return;
        }
        const merged = mergeWeek(data?.week, planRef.current);
        dispatch({ type: "hydrate", plan: merged });
        syncedUserRef.current = userId;
        const { error: upErr } = await supabase
          .from("plans")
          .upsert({ user_id: userId, week: merged });
        if (upErr) console.warn("[gymgo] plan save failed:", upErr.message);
      } catch (e) {
        syncedUserRef.current = userId;
        console.warn("[gymgo] plan sync error:", e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, hydrated]);

  // While signed in, save plan edits to the account (debounced). Guarded on the
  // initial merge so we never overwrite the account with local-only data first.
  useEffect(() => {
    const client = supabase;
    if (!client || !userId || userId !== syncedUserRef.current) return;
    const t = setTimeout(() => {
      client
        .from("plans")
        .upsert({ user_id: userId, week: plan })
        .then(({ error }) => {
          if (error) console.warn("[gymgo] plan sync failed:", error.message);
        });
    }, 1000);
    return () => clearTimeout(t);
  }, [plan, userId]);

  const setActiveDay = (day: Day) => {
    setActiveDayState(day);
    try {
      localStorage.setItem(ACTIVE_KEY, day);
    } catch {
      /* ignore */
    }
  };

  const value = useMemo<PlanContextValue>(
    () => ({
      plan,
      activeDay,
      setActiveDay,
      count: weekCount(plan),
      countForDay: (day: Day) => plan[day].length,
      has: (id: string) => plan[activeDay].includes(id),
      hasOnAnyDay: (id: string) => DAYS.some((d) => plan[d].includes(id)),
      add: (id: string) => dispatch({ type: "add", day: activeDay, id }),
      addTo: (day: Day, id: string) => dispatch({ type: "add", day, id }),
      remove: (day: Day, id: string) => dispatch({ type: "remove", day, id }),
      toggle: (id: string) =>
        dispatch(
          plan[activeDay].includes(id)
            ? { type: "remove", day: activeDay, id }
            : { type: "add", day: activeDay, id },
        ),
      move: (day: Day, from: number, to: number) =>
        dispatch({ type: "move", day, from, to }),
      clearDay: (day: Day) => dispatch({ type: "clearDay", day }),
      clear: () => dispatch({ type: "clear" }),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [plan, activeDay],
  );

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}

export function usePlan(): PlanContextValue {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan must be used within PlanProvider");
  return ctx;
}
