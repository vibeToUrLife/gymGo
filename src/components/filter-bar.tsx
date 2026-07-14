"use client";

import { useI18n } from "@/lib/i18n";
import {
  type Filters,
  type Facets,
  hasActiveFilters,
} from "@/lib/exercises";

const selectClass =
  "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200";

export function FilterBar({
  filters,
  onChange,
  facets,
  resultCount,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
  facets: Facets;
  resultCount: number;
}) {
  const { t, term } = useI18n();
  const set = (patch: Partial<Filters>) => onChange({ ...filters, ...patch });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <input
          type="search"
          value={filters.query}
          onChange={(e) => set({ query: e.target.value })}
          placeholder={t("search")}
          className="w-full flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-800 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 sm:min-w-[220px]"
          aria-label={t("search")}
        />

        <select
          value={filters.category}
          onChange={(e) => set({ category: e.target.value })}
          className={selectClass}
          aria-label={t("category")}
        >
          <option value="">{t("allCategories")}</option>
          {facets.categories.map((c) => (
            <option key={c} value={c}>
              {term(c)}
            </option>
          ))}
        </select>

        <select
          value={filters.muscle}
          onChange={(e) => set({ muscle: e.target.value })}
          className={selectClass}
          aria-label={t("muscle")}
        >
          <option value="">{t("allMuscles")}</option>
          {facets.muscles.map((m) => (
            <option key={m} value={m}>
              {term(m)}
            </option>
          ))}
        </select>

        <select
          value={filters.equipment}
          onChange={(e) => set({ equipment: e.target.value })}
          className={selectClass}
          aria-label={t("equipment")}
        >
          <option value="">{t("allEquipment")}</option>
          {facets.equipment.map((eq) => (
            <option key={eq} value={eq}>
              {term(eq)}
            </option>
          ))}
        </select>

        <select
          value={filters.level}
          onChange={(e) => set({ level: e.target.value })}
          className={selectClass}
          aria-label={t("level")}
        >
          <option value="">{t("allLevels")}</option>
          {facets.levels.map((lv) => (
            <option key={lv} value={lv}>
              {term(lv)}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {resultCount}
          </span>{" "}
          {t("exercisesCount")}
        </p>
        {hasActiveFilters(filters) && (
          <button
            type="button"
            onClick={() =>
              onChange({ query: "", category: "", equipment: "", muscle: "", level: "" })
            }
            className="text-sm font-medium text-orange-600 hover:text-orange-700 hover:underline"
          >
            {t("clear")}
          </button>
        )}
      </div>
    </div>
  );
}
