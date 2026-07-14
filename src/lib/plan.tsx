"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import { planReducer } from "./plan-reducer";

const STORAGE_KEY = "gymgo-plan";

type PlanContextValue = {
  ids: string[];
  count: number;
  has: (id: string) => boolean;
  add: (id: string) => void;
  remove: (id: string) => void;
  toggle: (id: string) => void;
  move: (from: number, to: number) => void;
  clear: () => void;
};

const PlanContext = createContext<PlanContextValue | null>(null);

export function PlanProvider({ children }: { children: ReactNode }) {
  const [ids, dispatch] = useReducer(planReducer, [] as string[]);
  const [hydrated, setHydrated] = useState(false);

  // Load persisted plan once.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) dispatch({ type: "hydrate", ids: JSON.parse(raw) });
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  // Persist after hydration so we never clobber saved data on first paint.
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {
      /* ignore */
    }
  }, [ids, hydrated]);

  const value = useMemo<PlanContextValue>(
    () => ({
      ids,
      count: ids.length,
      has: (id: string) => ids.includes(id),
      add: (id: string) => dispatch({ type: "add", id }),
      remove: (id: string) => dispatch({ type: "remove", id }),
      toggle: (id: string) =>
        dispatch(ids.includes(id) ? { type: "remove", id } : { type: "add", id }),
      move: (from: number, to: number) => dispatch({ type: "move", from, to }),
      clear: () => dispatch({ type: "clear" }),
    }),
    [ids],
  );

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}

export function usePlan(): PlanContextValue {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan must be used within PlanProvider");
  return ctx;
}
