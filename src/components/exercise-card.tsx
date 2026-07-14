"use client";

import type { Exercise } from "@/lib/types";
import { ExerciseImage } from "./exercise-image";
import { useI18n } from "@/lib/i18n";
import { usePlan } from "@/lib/plan";

export function ExerciseCard({
  ex,
  onOpen,
}: {
  ex: Exercise;
  onOpen: () => void;
}) {
  const { t, term } = useI18n();
  const plan = usePlan();
  const inPlan = plan.has(ex.id);

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
      <button
        type="button"
        onClick={onOpen}
        className="relative block aspect-square w-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
        aria-label={ex.name}
      >
        <ExerciseImage images={ex.images} name={ex.name} className="h-full w-full" />
        <span className="absolute left-2 top-2 rounded-full bg-orange-600/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow">
          {term(ex.level)}
        </span>
      </button>

      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <button
          type="button"
          onClick={onOpen}
          className="text-left focus:outline-none"
        >
          <h3 className="font-display text-lg font-semibold leading-tight text-slate-900 transition-colors group-hover:text-orange-600 dark:text-slate-100">
            {ex.name}
          </h3>
        </button>
        <p className="line-clamp-1 text-xs text-slate-500 dark:text-slate-400">
          {ex.primaryMuscles.map((m) => term(m)).join(" · ")}
        </p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <span className="truncate text-xs text-slate-400 dark:text-slate-500">
            {term(ex.equipment)}
          </span>
          <button
            type="button"
            onClick={() => plan.toggle(ex.id)}
            aria-pressed={inPlan}
            className={
              inPlan
                ? "shrink-0 rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-emerald-700"
                : "shrink-0 rounded-md bg-orange-600 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-orange-700"
            }
          >
            {inPlan ? `✓ ${t("inPlan")}` : `+ ${t("addToPlan")}`}
          </button>
        </div>
      </div>
    </div>
  );
}
