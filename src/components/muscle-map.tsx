"use client";

import { useState } from "react";
import { anteriorData, posteriorData, type Muscle } from "@/lib/body-model-data";
import { useI18n } from "@/lib/i18n";

type Props = { selected: string; onSelect: (muscle: string) => void };

// Our dataset (yuhonas) muscle name -> body-figure slug(s), for painting the selection.
const YUHONAS_TO_SLUGS: Record<string, Muscle[]> = {
  abdominals: ["abs"],
  abductors: ["abductors"],
  adductors: ["adductor"],
  biceps: ["biceps"],
  calves: ["calves"],
  chest: ["chest"],
  forearms: ["forearm"],
  glutes: ["gluteal"],
  hamstrings: ["hamstring"],
  lats: ["upper-back"],
  "lower back": ["lower-back"],
  "middle back": ["upper-back"],
  neck: ["neck"],
  quadriceps: ["quadriceps"],
  shoulders: ["front-deltoids", "back-deltoids"],
  traps: ["trapezius"],
  triceps: ["triceps"],
};

// Clicked figure slug -> dataset muscle to filter by (undefined = non-filterable region).
const SLUG_TO_YUHONAS: Partial<Record<Muscle, string>> = {
  abs: "abdominals",
  obliques: "abdominals",
  abductors: "abductors",
  adductor: "adductors",
  biceps: "biceps",
  calves: "calves",
  "left-soleus": "calves",
  "right-soleus": "calves",
  chest: "chest",
  forearm: "forearms",
  gluteal: "glutes",
  hamstring: "hamstrings",
  "upper-back": "lats",
  "lower-back": "lower back",
  neck: "neck",
  quadriceps: "quadriceps",
  "front-deltoids": "shoulders",
  "back-deltoids": "shoulders",
  trapezius: "traps",
  triceps: "triceps",
};

type Tip = { label: string; x: number; y: number };

function Figure({
  data,
  selectedSlugs,
  label,
  onPick,
  onHover,
  onLeave,
}: {
  data: typeof anteriorData;
  selectedSlugs: Muscle[];
  label: (muscle: string) => string;
  onPick: (yuhonas: string) => void;
  onHover: (text: string, x: number, y: number) => void;
  onLeave: () => void;
}) {
  return (
    <svg
      viewBox="0 0 100 200"
      className="h-[280px] w-auto sm:h-[330px]"
      role="group"
    >
      {data.map((entry) => {
        const y = SLUG_TO_YUHONAS[entry.muscle];
        const polys = entry.svgPoints.map((points, i) => (
          <polygon key={i} points={points} />
        ));

        if (!y) {
          // head / knees etc. — decorative, not filterable
          return (
            <g
              key={entry.muscle}
              className="pointer-events-none fill-slate-200 [stroke-width:0.3] stroke-slate-400/40 dark:fill-slate-700"
            >
              {polys}
            </g>
          );
        }

        const text = label(y);
        const active = selectedSlugs.includes(entry.muscle);
        return (
          <g
            key={entry.muscle}
            role="button"
            tabIndex={0}
            aria-label={text}
            aria-pressed={active}
            onClick={() => onPick(y)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onPick(y);
              }
            }}
            onMouseEnter={(e) => onHover(text, e.clientX, e.clientY)}
            onMouseMove={(e) => onHover(text, e.clientX, e.clientY)}
            onMouseLeave={onLeave}
            onFocus={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              onHover(text, r.left + r.width / 2, r.top);
            }}
            onBlur={onLeave}
            className={
              "cursor-pointer outline-none transition-colors [stroke-width:0.3] stroke-slate-400/50 " +
              (active
                ? "fill-orange-600"
                : "fill-slate-300 hover:fill-orange-400 focus-visible:fill-orange-500 dark:fill-slate-600 dark:hover:fill-orange-400")
            }
          >
            <title>{text}</title>
            {polys}
          </g>
        );
      })}
    </svg>
  );
}

export function MuscleMap({ selected, onSelect }: Props) {
  const { t, term } = useI18n();
  const [tip, setTip] = useState<Tip | null>(null);

  const selectedSlugs = selected ? YUHONAS_TO_SLUGS[selected] ?? [] : [];
  const pick = (y: string) => {
    setTip(null);
    onSelect(y === selected ? "" : y);
  };
  const hover = (text: string, x: number, y: number) => setTip({ label: text, x, y });
  const leave = () => setTip(null);

  return (
    <div className="relative flex items-start justify-center gap-4 sm:gap-10">
      <figure className="flex flex-col items-center">
        <Figure
          data={anteriorData}
          selectedSlugs={selectedSlugs}
          label={term}
          onPick={pick}
          onHover={hover}
          onLeave={leave}
        />
        <figcaption className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
          {t("frontView")}
        </figcaption>
      </figure>

      <figure className="flex flex-col items-center">
        <Figure
          data={posteriorData}
          selectedSlugs={selectedSlugs}
          label={term}
          onPick={pick}
          onHover={hover}
          onLeave={leave}
        />
        <figcaption className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
          {t("backView")}
        </figcaption>
      </figure>

      {tip && (
        <div
          role="status"
          className="pointer-events-none fixed z-[60] whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white shadow-lg dark:bg-slate-700"
          style={{ left: tip.x + 14, top: tip.y + 16 }}
        >
          {tip.label}
        </div>
      )}
    </div>
  );
}
