"use client";

import { useEffect } from "react";
import { MuscleMap } from "./muscle-map";
import { useI18n } from "@/lib/i18n";

export function MuscleMapModal({
  selected,
  onSelect,
  onClose,
}: {
  selected: string;
  onSelect: (muscle: string) => void;
  onClose: () => void;
}) {
  const { t, term } = useI18n();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t("filterByMuscle")}
    >
      <div
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 p-4 dark:border-slate-800">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
              {t("filterByMuscle")}
            </h2>
            <p className="mt-0.5 text-sm font-medium text-orange-600">
              {selected ? term(selected) : t("allMuscles")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {selected && (
              <button
                type="button"
                onClick={() => onSelect("")}
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-orange-500 hover:text-orange-600 dark:border-slate-700 dark:text-slate-300"
              >
                {t("clear")}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label={t("close")}
              className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <span className="block h-5 w-5 text-lg leading-5">✕</span>
            </button>
          </div>
        </div>

        <div className="overflow-y-auto p-5">
          <MuscleMap selected={selected} onSelect={onSelect} />
          <p className="mt-3 text-center text-xs text-slate-400">
            {t("muscleMapHint")}
          </p>
        </div>
      </div>
    </div>
  );
}
