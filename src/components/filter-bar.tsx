"use client";

import { useState, type ReactNode } from "react";
import { useI18n } from "@/lib/i18n";
import { type Filters, type Facets, hasActiveFilters } from "@/lib/exercises";
import { MuscleMapModal } from "./muscle-map-modal";
import {
  CATEGORY_ICON,
  EQUIPMENT_ICON,
  LEVEL_RANK,
  LevelBars,
  IconPerson,
} from "./filter-icons";

const LEVELS = ["beginner", "intermediate", "expert"] as const;

function Chip({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors " +
        (active
          ? "border-orange-600 bg-orange-600 text-white shadow-sm"
          : "border-slate-200 bg-white text-slate-600 hover:border-orange-400 hover:text-orange-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-orange-500/70 dark:hover:text-orange-400")
      }
    >
      {icon}
      {label}
    </button>
  );
}

function Strip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">
        {label}
      </span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function SegBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors " +
        (active
          ? "bg-orange-600 text-white shadow-sm"
          : "text-slate-500 hover:text-orange-600 dark:text-slate-400 dark:hover:text-orange-400")
      }
    >
      {children}
    </button>
  );
}

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
  const [mapOpen, setMapOpen] = useState(false);
  const [showAllEquip, setShowAllEquip] = useState(false);

  const categories = facets.categories;
  const equipment = facets.equipment;
  const levels = LEVELS.filter((l) => facets.levels.includes(l));

  // Equipment has many options — collapse to one tidy set, but always keep the
  // selected chip visible and let the user reveal the rest.
  const EQUIP_COLLAPSED = 7;
  let shownEquip = showAllEquip ? equipment : equipment.slice(0, EQUIP_COLLAPSED);
  if (!showAllEquip && filters.equipment && !shownEquip.includes(filters.equipment)) {
    shownEquip = [...shownEquip, filters.equipment];
  }
  const hiddenEquip = equipment.length - shownEquip.length;

  return (
    <div className="flex flex-col gap-4">
      {/* Search + muscle map + difficulty */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <input
          type="search"
          value={filters.query}
          onChange={(e) => set({ query: e.target.value })}
          placeholder={t("search")}
          className="w-full flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          aria-label={t("search")}
        />

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setMapOpen(true)}
            aria-haspopup="dialog"
            className={
              "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-semibold shadow-sm transition-colors " +
              (filters.muscle
                ? "border-orange-600 bg-orange-600 text-white"
                : "border-slate-300 bg-white text-slate-700 hover:border-orange-400 hover:text-orange-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200")
            }
          >
            <IconPerson />
            {filters.muscle ? term(filters.muscle) : t("muscleMap")}
          </button>

          {/* Difficulty segmented control */}
          <div className="inline-flex items-center rounded-full border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-900">
            <SegBtn active={!filters.level} onClick={() => set({ level: "" })}>
              {t("allLevels")}
            </SegBtn>
            {levels.map((lv) => (
              <SegBtn
                key={lv}
                active={filters.level === lv}
                onClick={() => set({ level: filters.level === lv ? "" : lv })}
              >
                <LevelBars n={LEVEL_RANK[lv]} />
                {term(lv)}
              </SegBtn>
            ))}
          </div>
        </div>
      </div>

      {/* Category chips */}
      <Strip label={t("category")}>
        {categories.map((c) => {
          const Icon = CATEGORY_ICON[c];
          return (
            <Chip
              key={c}
              active={filters.category === c}
              onClick={() => set({ category: filters.category === c ? "" : c })}
              label={term(c)}
              icon={Icon ? <Icon /> : undefined}
            />
          );
        })}
      </Strip>

      {/* Equipment chips */}
      <Strip label={t("equipment")}>
        {shownEquip.map((eq) => {
          const Icon = EQUIPMENT_ICON[eq];
          return (
            <Chip
              key={eq}
              active={filters.equipment === eq}
              onClick={() => set({ equipment: filters.equipment === eq ? "" : eq })}
              label={term(eq)}
              icon={Icon ? <Icon /> : undefined}
            />
          );
        })}
        {equipment.length > EQUIP_COLLAPSED && (
          <button
            type="button"
            onClick={() => setShowAllEquip((v) => !v)}
            aria-expanded={showAllEquip}
            className="inline-flex shrink-0 items-center gap-1 rounded-full border border-dashed border-slate-300 px-3.5 py-2 text-sm font-semibold text-slate-500 transition-colors hover:border-orange-400 hover:text-orange-600 dark:border-slate-600 dark:text-slate-400 dark:hover:border-orange-500/70"
          >
            {showAllEquip ? t("filterLess") : `+${hiddenEquip} ${t("filterMore")}`}
          </button>
        )}
      </Strip>

      {/* Result count + clear */}
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
            className="text-sm font-semibold text-orange-600 hover:text-orange-700 hover:underline"
          >
            {t("clear")}
          </button>
        )}
      </div>

      {mapOpen && (
        <MuscleMapModal
          selected={filters.muscle}
          onSelect={(muscle) => {
            set({ muscle });
            setMapOpen(false);
          }}
          onClose={() => setMapOpen(false)}
        />
      )}
    </div>
  );
}
