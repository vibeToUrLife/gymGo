"use client";

import { useEffect, useRef } from "react";
import type { Exercise } from "@/lib/types";
import { ExerciseImage } from "./exercise-image";
import { useI18n } from "@/lib/i18n";
import { usePlan } from "@/lib/plan";

function MetaBadge({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="rounded-lg bg-slate-100 px-3 py-1.5 dark:bg-slate-800">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </div>
      <div className="text-sm font-medium text-slate-800 dark:text-slate-100">
        {value}
      </div>
    </div>
  );
}

export function ExerciseModal({
  ex,
  index,
  total,
  onClose,
  onPrev,
  onNext,
}: {
  ex: Exercise;
  index: number;
  total: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const { t, term } = useI18n();
  const plan = usePlan();
  const inPlan = plan.has(ex.id);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") onPrev();
      else if (e.key === "ArrowRight") onNext();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose, onPrev, onNext]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={ex.name}
    >
      <div
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        tabIndex={-1}
        className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl outline-none dark:bg-slate-900"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 p-4 dark:border-slate-800">
          <div>
            <h2 className="font-display text-2xl font-bold leading-tight text-slate-900 dark:text-white">
              {ex.name}
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">
              {index + 1} {t("ofTotal")} {total}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("close")}
            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <span className="block h-5 w-5 text-lg leading-5">✕</span>
          </button>
        </div>

        {/* Body */}
        <div className="grid gap-5 overflow-y-auto p-4 sm:grid-cols-2 sm:p-5">
          <div>
            <ExerciseImage
              images={ex.images}
              name={ex.name}
              className="aspect-square w-full rounded-xl border border-slate-200 dark:border-slate-800"
            />
            <div className="mt-3 grid grid-cols-2 gap-2">
              <MetaBadge label={t("category")} value={term(ex.category)} />
              <MetaBadge label={t("level")} value={term(ex.level)} />
              <MetaBadge label={t("equipment")} value={term(ex.equipment)} />
              <MetaBadge label={t("forceLabel")} value={term(ex.force)} />
              {ex.mechanic && (
                <MetaBadge label={t("typeLabel")} value={term(ex.mechanic)} />
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-orange-600">
                {t("primaryMuscles")}
              </h3>
              <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">
                {ex.primaryMuscles.map((m) => term(m)).join(", ") || "—"}
              </p>
              {ex.secondaryMuscles.length > 0 && (
                <>
                  <h3 className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {t("secondaryMuscles")}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {ex.secondaryMuscles.map((m) => term(m)).join(", ")}
                  </p>
                </>
              )}
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-orange-600">
                {t("howTo")}
              </h3>
              <ol className="mt-2 space-y-2">
                {ex.instructions.map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm text-slate-700 dark:text-slate-200">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-100 text-[11px] font-bold text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 border-t border-slate-200 p-4 dark:border-slate-800">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onPrev}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              ← {t("prev")}
            </button>
            <button
              type="button"
              onClick={onNext}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {t("next")} →
            </button>
          </div>
          <button
            type="button"
            onClick={() => plan.toggle(ex.id)}
            className={
              inPlan
                ? "rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                : "rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-700"
            }
          >
            {inPlan ? `✓ ${t("inPlan")}` : `+ ${t("addToPlan")}`}
          </button>
        </div>
      </div>
    </div>
  );
}
