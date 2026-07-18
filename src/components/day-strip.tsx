"use client";

import { usePlan } from "@/lib/plan";
import { useI18n } from "@/lib/i18n";
import { DAYS } from "@/lib/plan-reducer";

/**
 * Row of the seven weekdays. Highlights the active day, shows a per-day count,
 * and sets the active day on click. Shared by Browse (add target) and Plan (tabs).
 */
export function DayStrip({ size = "md" }: { size?: "sm" | "md" }) {
  const plan = usePlan();
  const { day } = useI18n();
  const pad = size === "sm" ? "px-2.5 py-1 text-xs" : "px-3.5 py-2 text-sm";

  return (
    <div className="flex flex-wrap gap-1.5">
      {DAYS.map((d) => {
        const active = plan.activeDay === d;
        const n = plan.countForDay(d);
        return (
          <button
            key={d}
            type="button"
            onClick={() => plan.setActiveDay(d)}
            aria-pressed={active}
            className={
              "relative rounded-lg font-semibold transition " +
              pad +
              " " +
              (active
                ? "bg-orange-600 text-white shadow"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800")
            }
          >
            {day(d, "short")}
            {n > 0 && (
              <span
                className={
                  "ml-1.5 inline-flex min-w-[1.1rem] items-center justify-center rounded-full px-1 py-0.5 text-[10px] font-bold " +
                  (active ? "bg-white/25 text-white" : "bg-emerald-500 text-white")
                }
              >
                {n}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
