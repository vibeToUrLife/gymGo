"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Locale = "en" | "zh";

const STORAGE_KEY = "gymgo-locale";

// --- UI strings ---------------------------------------------------------
const UI: Record<string, Record<Locale, string>> = {
  appName: { en: "gymGo", zh: "gymGo" },
  tagline: {
    en: "Plan your training. See every move.",
    zh: "规划你的训练，看清每个动作。",
  },
  navBrowse: { en: "Browse", zh: "动作库" },
  navPlan: { en: "My Plan", zh: "我的计划" },
  search: { en: "Search exercises…", zh: "搜索动作…" },
  category: { en: "Category", zh: "类别" },
  muscle: { en: "Muscle", zh: "肌群" },
  equipment: { en: "Equipment", zh: "器械" },
  level: { en: "Level", zh: "难度" },
  allCategories: { en: "All categories", zh: "全部类别" },
  allMuscles: { en: "All muscles", zh: "全部肌群" },
  allEquipment: { en: "All equipment", zh: "全部器械" },
  allLevels: { en: "All levels", zh: "全部难度" },
  clear: { en: "Clear filters", zh: "清除筛选" },
  exercisesCount: { en: "exercises", zh: "个动作" },
  loading: { en: "Loading exercises…", zh: "正在加载动作…" },
  noResults: { en: "No exercises match your filters.", zh: "没有符合筛选条件的动作。" },
  loadMore: { en: "Show more", zh: "显示更多" },
  addToPlan: { en: "Add to plan", zh: "加入计划" },
  inPlan: { en: "In plan", zh: "已加入" },
  remove: { en: "Remove", zh: "移除" },
  howTo: { en: "How to perform", zh: "动作要领" },
  primaryMuscles: { en: "Primary muscles", zh: "主要肌群" },
  secondaryMuscles: { en: "Secondary muscles", zh: "辅助肌群" },
  forceLabel: { en: "Force", zh: "发力" },
  typeLabel: { en: "Type", zh: "类型" },
  prev: { en: "Previous", zh: "上一个" },
  next: { en: "Next", zh: "下一个" },
  close: { en: "Close", zh: "关闭" },
  ofTotal: { en: "of", zh: "/" },
  myPlanTitle: { en: "My Training Plan", zh: "我的训练计划" },
  emptyPlan: { en: "Your plan is empty.", zh: "你的计划还是空的。" },
  emptyPlanHint: {
    en: "Browse the library and add exercises to build your session.",
    zh: "去动作库挑选动作，组建你的训练。",
  },
  browseCta: { en: "Browse exercises", zh: "去挑选动作" },
  moveUp: { en: "Move up", zh: "上移" },
  moveDown: { en: "Move down", zh: "下移" },
  clearPlan: { en: "Clear all", zh: "清空" },
  targetedMuscles: { en: "Targeted muscles", zh: "锻炼肌群" },
  exerciseCountLabel: { en: "exercises in this plan", zh: "个动作在此计划中" },
  step: { en: "Step", zh: "步骤" },
  themeToggle: { en: "Toggle theme", zh: "切换主题" },
  builtWith: {
    en: "Data: yuhonas/free-exercise-db (public domain).",
    zh: "数据来源：yuhonas/free-exercise-db（公有领域）。",
  },
};

// --- Domain terms (exercise metadata) ----------------------------------
const TERMS: Record<string, Record<Locale, string>> = {
  // categories
  strength: { en: "Strength", zh: "力量" },
  stretching: { en: "Stretching", zh: "拉伸" },
  plyometrics: { en: "Plyometrics", zh: "增强式" },
  strongman: { en: "Strongman", zh: "力量猛士" },
  powerlifting: { en: "Powerlifting", zh: "力量举" },
  cardio: { en: "Cardio", zh: "有氧" },
  "olympic weightlifting": { en: "Olympic Weightlifting", zh: "奥林匹克举重" },
  // levels
  beginner: { en: "Beginner", zh: "初级" },
  intermediate: { en: "Intermediate", zh: "中级" },
  expert: { en: "Expert", zh: "高级" },
  // force
  push: { en: "Push", zh: "推" },
  pull: { en: "Pull", zh: "拉" },
  static: { en: "Static", zh: "静态" },
  // mechanic
  compound: { en: "Compound", zh: "复合动作" },
  isolation: { en: "Isolation", zh: "孤立动作" },
  // equipment
  "body only": { en: "Body only", zh: "徒手" },
  machine: { en: "Machine", zh: "器械" },
  other: { en: "Other", zh: "其他" },
  "foam roll": { en: "Foam roll", zh: "泡沫轴" },
  kettlebells: { en: "Kettlebells", zh: "壶铃" },
  dumbbell: { en: "Dumbbell", zh: "哑铃" },
  cable: { en: "Cable", zh: "拉索" },
  barbell: { en: "Barbell", zh: "杠铃" },
  bands: { en: "Bands", zh: "弹力带" },
  "medicine ball": { en: "Medicine ball", zh: "药球" },
  "exercise ball": { en: "Exercise ball", zh: "健身球" },
  "e-z curl bar": { en: "E-Z curl bar", zh: "曲柄杠铃" },
  // muscles
  abdominals: { en: "Abdominals", zh: "腹肌" },
  abductors: { en: "Abductors", zh: "外展肌" },
  adductors: { en: "Adductors", zh: "内收肌" },
  biceps: { en: "Biceps", zh: "二头肌" },
  calves: { en: "Calves", zh: "小腿" },
  chest: { en: "Chest", zh: "胸部" },
  forearms: { en: "Forearms", zh: "前臂" },
  glutes: { en: "Glutes", zh: "臀肌" },
  hamstrings: { en: "Hamstrings", zh: "腘绳肌" },
  lats: { en: "Lats", zh: "背阔肌" },
  "lower back": { en: "Lower back", zh: "下背部" },
  "middle back": { en: "Middle back", zh: "中背部" },
  neck: { en: "Neck", zh: "颈部" },
  quadriceps: { en: "Quadriceps", zh: "股四头肌" },
  shoulders: { en: "Shoulders", zh: "肩部" },
  traps: { en: "Traps", zh: "斜方肌" },
  triceps: { en: "Triceps", zh: "三头肌" },
};

function titleCase(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

type I18nContextValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  toggleLocale: () => void;
  t: (key: keyof typeof UI | string) => string;
  term: (value: string | null | undefined) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "en" || saved === "zh") setLocaleState(saved);
    } catch {
      /* ignore */
    }
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
  }, []);

  const toggleLocale = useCallback(
    () => setLocale(locale === "en" ? "zh" : "en"),
    [locale, setLocale],
  );

  const value = useMemo<I18nContextValue>(() => {
    const t = (key: string) => UI[key]?.[locale] ?? key;
    const term = (value: string | null | undefined) => {
      if (!value) return "";
      return TERMS[value.toLowerCase()]?.[locale] ?? titleCase(value);
    };
    return { locale, setLocale, toggleLocale, t, term };
  }, [locale, setLocale, toggleLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within LocaleProvider");
  return ctx;
}
