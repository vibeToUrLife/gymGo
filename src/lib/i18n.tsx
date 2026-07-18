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
import type { Day } from "./plan-reducer";

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
  muscleMap: { en: "Muscle map", zh: "肌肉图" },
  filterByMuscle: { en: "Filter by muscle", zh: "按肌群筛选" },
  frontView: { en: "Front", zh: "正面" },
  backView: { en: "Back", zh: "背面" },
  muscleMapHint: {
    en: "Tap a muscle to filter. Tap it again to clear.",
    zh: "点击肌群进行筛选，再次点击可取消。",
  },
  filterMore: { en: "more", zh: "更多" },
  filterLess: { en: "Show less", zh: "收起" },
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
  myPlanTitle: { en: "My Weekly Plan", zh: "我的每周计划" },
  emptyPlan: { en: "Nothing planned for this day yet.", zh: "这一天还没有安排。" },
  emptyPlanHint: {
    en: "Pick this day in Browse, then add exercises to it.",
    zh: "在动作库选中这一天，再把动作加进来。",
  },
  browseCta: { en: "Browse exercises", zh: "去挑选动作" },
  moveUp: { en: "Move up", zh: "上移" },
  moveDown: { en: "Move down", zh: "下移" },
  clearPlan: { en: "Clear all", zh: "清空全部" },
  clearDay: { en: "Clear day", zh: "清空这天" },
  targetedMuscles: { en: "Targeted muscles", zh: "锻炼肌群" },
  exerciseCountLabel: { en: "exercises in this plan", zh: "个动作在此计划中" },
  addingTo: { en: "Adding to", zh: "添加到" },
  restDay: { en: "Rest", zh: "休息" },
  weekTotal: { en: "exercises this week", zh: "个动作（本周）" },
  dayCountSuffix: { en: "exercises", zh: "个动作" },
  step: { en: "Step", zh: "步骤" },
  // auth
  signIn: { en: "Sign in", zh: "登录" },
  signOut: { en: "Sign out", zh: "退出登录" },
  signUp: { en: "Sign up", zh: "注册" },
  account: { en: "Account", zh: "账户" },
  email: { en: "Email", zh: "邮箱" },
  password: { en: "Password", zh: "密码" },
  continueWithGoogle: { en: "Continue with Google", zh: "使用 Google 继续" },
  orWithEmail: { en: "or with email", zh: "或使用邮箱" },
  authSignInTitle: { en: "Welcome back", zh: "欢迎回来" },
  authSignUpTitle: { en: "Create your account", zh: "创建你的账户" },
  authSignInSubtitle: {
    en: "Sign in to save and sync your plan.",
    zh: "登录以保存并同步你的计划。",
  },
  authSignUpSubtitle: {
    en: "Your plan will sync across your devices.",
    zh: "你的计划将在各设备间同步。",
  },
  authToSignUp: { en: "New here? Create an account", zh: "还没有账户？去注册" },
  authToSignIn: { en: "Already have an account? Sign in", zh: "已有账户？去登录" },
  authEmailSent: {
    en: "Almost there — check your email to confirm your account.",
    zh: "就快好了——请查收邮件以确认你的账户。",
  },
  authNeedFields: { en: "Enter your email and password.", zh: "请输入邮箱和密码。" },
  authShortPassword: {
    en: "Password must be at least 6 characters.",
    zh: "密码至少需要 6 个字符。",
  },
  authNotConfigured: { en: "Sign-in isn't set up yet.", zh: "登录功能尚未配置。" },
  planSyncsHint: {
    en: "Signed in — your plan syncs to your account.",
    zh: "已登录——你的计划已同步到账户。",
  },
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

const DAY_NAMES: Record<Day, { short: Record<Locale, string>; long: Record<Locale, string> }> = {
  mon: { short: { en: "Mon", zh: "周一" }, long: { en: "Monday", zh: "星期一" } },
  tue: { short: { en: "Tue", zh: "周二" }, long: { en: "Tuesday", zh: "星期二" } },
  wed: { short: { en: "Wed", zh: "周三" }, long: { en: "Wednesday", zh: "星期三" } },
  thu: { short: { en: "Thu", zh: "周四" }, long: { en: "Thursday", zh: "星期四" } },
  fri: { short: { en: "Fri", zh: "周五" }, long: { en: "Friday", zh: "星期五" } },
  sat: { short: { en: "Sat", zh: "周六" }, long: { en: "Saturday", zh: "星期六" } },
  sun: { short: { en: "Sun", zh: "周日" }, long: { en: "Sunday", zh: "星期日" } },
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
  day: (d: Day, form?: "short" | "long") => string;
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
    const day = (d: Day, form: "short" | "long" = "long") =>
      DAY_NAMES[d][form][locale];
    return { locale, setLocale, toggleLocale, t, term, day };
  }, [locale, setLocale, toggleLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within LocaleProvider");
  return ctx;
}
