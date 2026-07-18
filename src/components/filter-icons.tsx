import type { ReactNode } from "react";

// Simple, consistent 24x24 line icons (stroke = currentColor) so chips can
// inherit their text color for active/inactive states. No emoji, no dependency.

function Svg({
  children,
  fill = "none",
  className = "h-4 w-4",
}: {
  children: ReactNode;
  fill?: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={fill}
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const IconDumbbell = () => (
  <Svg>
    <path d="M3 9v6M6 7v10M18 7v10M21 9v6M6 12h12" />
  </Svg>
);

export const IconBarbell = () => (
  <Svg>
    <path d="M2 12h20M5 8v8M8 9v6M16 9v6M19 8v8" />
  </Svg>
);

export const IconKettlebell = () => (
  <Svg>
    <path d="M9.5 7a2.5 2.5 0 0 1 5 0" />
    <circle cx="12" cy="14" r="5.2" />
  </Svg>
);

export const IconPerson = () => (
  <Svg>
    <circle cx="12" cy="5" r="2.4" />
    <path d="M12 7.4v6.2M12 9.8l-4 2M12 9.8l4 2M12 13.6l-3 6M12 13.6l3 6" />
  </Svg>
);

export const IconStretch = () => (
  <Svg>
    <circle cx="12" cy="5" r="2.4" />
    <path d="M12 7.4v6.2M12 9.5l-4-3M12 9.5l4-3M12 13.6l-3 6M12 13.6l3 6" />
  </Svg>
);

export const IconZap = () => (
  <Svg fill="currentColor" className="h-4 w-4">
    <path
      d="M13 2 4 14h6l-1 8 9-12h-6z"
      stroke="none"
    />
  </Svg>
);

export const IconMedal = () => (
  <Svg>
    <path d="M8.5 8.5 6 3M15.5 8.5 18 3" />
    <circle cx="12" cy="14" r="5" />
    <path d="M12 12.2v3.6M10.6 13.4l2.8 1.2" />
  </Svg>
);

export const IconActivity = () => (
  <Svg>
    <path d="M3 12h4l2.5-6 4 12 2.5-6H21" />
  </Svg>
);

export const IconMachine = () => (
  <Svg>
    <rect x="9" y="4" width="6" height="13" rx="1" />
    <path d="M9 8h6M9 11h6M9 14h6M12 17v3M8 20h8" />
  </Svg>
);

export const IconCable = () => (
  <Svg>
    <path d="M6 3v5a6 6 0 0 0 12 0V3" />
    <path d="M9 3V1.8M15 3V1.8M12 14v6" />
  </Svg>
);

export const IconBand = () => (
  <Svg>
    <path d="M4 12c3-6 13-6 16 0-3 6-13 6-16 0Z" />
  </Svg>
);

export const IconBall = () => (
  <Svg>
    <circle cx="12" cy="12" r="8" />
    <path d="M4 12h16M12 4v16" />
  </Svg>
);

export const IconFoamRoll = () => (
  <Svg>
    <ellipse cx="7" cy="12" rx="2" ry="6" />
    <path d="M7 6h10M7 18h10" />
    <ellipse cx="17" cy="12" rx="2" ry="6" />
  </Svg>
);

export const IconDots = () => (
  <Svg fill="currentColor">
    <g stroke="none">
      <circle cx="5" cy="12" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="19" cy="12" r="1.6" />
    </g>
  </Svg>
);

/** Signal-style difficulty bars: `n` of 3 filled. */
export function LevelBars({ n }: { n: number }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <g fill="currentColor">
        <rect x="3" y="14" width="4" height="7" rx="1" opacity={n >= 1 ? 1 : 0.3} />
        <rect x="10" y="9" width="4" height="12" rx="1" opacity={n >= 2 ? 1 : 0.3} />
        <rect x="17" y="4" width="4" height="17" rx="1" opacity={n >= 3 ? 1 : 0.3} />
      </g>
    </svg>
  );
}

type IconFn = () => ReactNode;

export const CATEGORY_ICON: Record<string, IconFn> = {
  strength: IconDumbbell,
  stretching: IconStretch,
  plyometrics: IconZap,
  strongman: IconKettlebell,
  powerlifting: IconBarbell,
  cardio: IconActivity,
  "olympic weightlifting": IconMedal,
};

export const EQUIPMENT_ICON: Record<string, IconFn> = {
  "body only": IconPerson,
  machine: IconMachine,
  dumbbell: IconDumbbell,
  barbell: IconBarbell,
  "e-z curl bar": IconBarbell,
  kettlebells: IconKettlebell,
  cable: IconCable,
  bands: IconBand,
  "medicine ball": IconBall,
  "exercise ball": IconBall,
  "foam roll": IconFoamRoll,
  other: IconDots,
};

export const LEVEL_RANK: Record<string, number> = {
  beginner: 1,
  intermediate: 2,
  expert: 3,
};
