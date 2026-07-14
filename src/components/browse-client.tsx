"use client";

import { useEffect, useMemo, useState } from "react";
import { useExercises } from "@/lib/data";
import { useI18n } from "@/lib/i18n";
import {
  emptyFilters,
  facets as computeFacets,
  searchAndFilter,
  type Filters,
} from "@/lib/exercises";
import { ExerciseCard } from "./exercise-card";
import { ExerciseModal } from "./exercise-modal";
import { FilterBar } from "./filter-bar";

const PAGE = 48;

export function BrowseClient() {
  const { exercises, loading, error } = useExercises();
  const { t } = useI18n();

  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [visible, setVisible] = useState(PAGE);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const facets = useMemo(() => computeFacets(exercises), [exercises]);
  const results = useMemo(
    () => searchAndFilter(exercises, filters),
    [exercises, filters],
  );

  // Reset pagination + close any open modal when the filter set changes.
  useEffect(() => {
    setVisible(PAGE);
    setOpenIndex(null);
  }, [filters]);

  const shown = results.slice(0, visible);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <section className="mb-6">
        <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          {t("tagline")}
        </h1>
      </section>

      <div className="mb-6">
        <FilterBar
          filters={filters}
          onChange={setFilters}
          facets={facets}
          resultCount={results.length}
        />
      </div>

      {loading ? (
        <GridSkeleton />
      ) : error ? (
        <p className="py-16 text-center text-sm text-red-500">
          {error} — {t("noResults")}
        </p>
      ) : results.length === 0 ? (
        <p className="py-16 text-center text-slate-500 dark:text-slate-400">
          {t("noResults")}
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {shown.map((ex, i) => (
              <ExerciseCard key={ex.id} ex={ex} onOpen={() => setOpenIndex(i)} />
            ))}
          </div>

          {visible < results.length && (
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={() => setVisible((v) => v + PAGE)}
                className="rounded-lg border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-orange-500 hover:text-orange-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                {t("loadMore")} ({results.length - visible})
              </button>
            </div>
          )}
        </>
      )}

      {openIndex !== null && results[openIndex] && (
        <ExerciseModal
          ex={results[openIndex]}
          index={openIndex}
          total={results.length}
          onClose={() => setOpenIndex(null)}
          onPrev={() =>
            setOpenIndex((i) =>
              i === null ? i : (i - 1 + results.length) % results.length,
            )
          }
          onNext={() =>
            setOpenIndex((i) =>
              i === null ? i : (i + 1) % results.length,
            )
          }
        />
      )}
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="aspect-square w-full bg-slate-200 dark:bg-slate-800" />
          <div className="space-y-2 p-3">
            <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-3 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
      ))}
    </div>
  );
}
