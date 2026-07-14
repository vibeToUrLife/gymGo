"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useExercises } from "@/lib/data";
import { usePlan } from "@/lib/plan";
import { useI18n } from "@/lib/i18n";
import { ExerciseImage } from "./exercise-image";
import type { Exercise } from "@/lib/types";

export function PlanClient() {
  const { byId, loading } = useExercises();
  const plan = usePlan();
  const { t, term } = useI18n();

  const items = useMemo(
    () => plan.ids.map((id) => byId.get(id)).filter((e): e is Exercise => Boolean(e)),
    [plan.ids, byId],
  );

  const muscles = useMemo(() => {
    const set = new Set<string>();
    items.forEach((e) => e.primaryMuscles.forEach((m) => set.add(m)));
    return Array.from(set).sort();
  }, [items]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            {t("myPlanTitle")}
          </h1>
          {plan.count > 0 && (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {plan.count}
              </span>{" "}
              {t("exerciseCountLabel")}
            </p>
          )}
        </div>
        {plan.count > 0 && (
          <button
            type="button"
            onClick={plan.clear}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:border-red-400 hover:text-red-600 dark:border-slate-700 dark:text-slate-300"
          >
            {t("clearPlan")}
          </button>
        )}
      </div>

      {plan.count === 0 && !loading ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center dark:border-slate-700 dark:bg-slate-900">
          <div className="text-4xl">📋</div>
          <p className="mt-3 text-lg font-semibold text-slate-700 dark:text-slate-200">
            {t("emptyPlan")}
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t("emptyPlanHint")}
          </p>
          <Link
            href="/"
            className="mt-5 inline-block rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700"
          >
            {t("browseCta")}
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_240px]">
          <ol className="space-y-3">
            {items.map((ex, i) => (
              <li
                key={ex.id}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">
                  {i + 1}
                </span>
                <ExerciseImage
                  images={ex.images}
                  name={ex.name}
                  play={false}
                  className="h-14 w-14 shrink-0 rounded-lg border border-slate-200 dark:border-slate-700"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-display text-base font-semibold text-slate-900 dark:text-slate-100">
                    {ex.name}
                  </h3>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                    {ex.primaryMuscles.map((m) => term(m)).join(" · ")} ·{" "}
                    {term(ex.equipment)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => plan.move(i, i - 1)}
                    disabled={i === 0}
                    aria-label={t("moveUp")}
                    className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-slate-800"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={() => plan.move(i, i + 1)}
                    disabled={i === items.length - 1}
                    aria-label={t("moveDown")}
                    className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-slate-800"
                  >
                    ▼
                  </button>
                  <button
                    type="button"
                    onClick={() => plan.remove(ex.id)}
                    aria-label={t("remove")}
                    className="rounded-md p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30"
                  >
                    ✕
                  </button>
                </div>
              </li>
            ))}
          </ol>

          {muscles.length > 0 && (
            <aside className="h-fit rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-orange-600">
                {t("targetedMuscles")}
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {muscles.map((m) => (
                  <span
                    key={m}
                    className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  >
                    {term(m)}
                  </span>
                ))}
              </div>
            </aside>
          )}
        </div>
      )}
    </div>
  );
}
