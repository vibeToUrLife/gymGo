"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { usePlan } from "@/lib/plan";

export function SiteHeader() {
  const { t, locale, toggleLocale } = useI18n();
  const { theme, toggle } = useTheme();
  const plan = usePlan();
  const pathname = usePathname();

  const navLink = (href: string, label: string, badge?: number) => {
    const active = pathname === href;
    return (
      <Link
        href={href}
        className={
          "relative rounded-lg px-3 py-1.5 text-sm font-semibold transition " +
          (active
            ? "bg-orange-600 text-white"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white")
        }
      >
        {label}
        {badge ? (
          <span className="ml-1.5 inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-emerald-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
            {badge}
          </span>
        ) : null}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-slate-50/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-600 text-lg">
            🏋️
          </span>
          <span className="font-display text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            gym<span className="text-orange-600">Go</span>
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {navLink("/", t("navBrowse"))}
          {navLink("/plan", t("navPlan"), plan.count)}
        </nav>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={toggleLocale}
            className="rounded-lg px-2.5 py-1.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="Toggle language"
          >
            {locale === "en" ? "中文" : "EN"}
          </button>
          <button
            type="button"
            onClick={toggle}
            className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label={t("themeToggle")}
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
        </div>
      </div>
    </header>
  );
}
