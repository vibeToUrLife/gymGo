"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Exercise } from "./types";

type DataContextValue = {
  exercises: Exercise[];
  byId: Map<string, Exercise>;
  loading: boolean;
  error: string | null;
};

const DataContext = createContext<DataContextValue | null>(null);

/**
 * Fetches the bundled exercise dataset once and shares it across routes.
 * Lives in the root layout, so navigating Browse <-> Plan does not refetch.
 */
export function ExercisesProvider({ children }: { children: ReactNode }) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/exercises.json")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: Exercise[]) => {
        if (!active) return;
        setExercises(data);
        setLoading(false);
      })
      .catch((e: unknown) => {
        if (!active) return;
        setError(e instanceof Error ? e.message : String(e));
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<DataContextValue>(() => {
    const byId = new Map(exercises.map((e) => [e.id, e]));
    return { exercises, byId, loading, error };
  }, [exercises, loading, error]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useExercises(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useExercises must be used within ExercisesProvider");
  return ctx;
}
