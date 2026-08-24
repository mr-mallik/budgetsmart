import { emptyCategoryItems } from "./categories";
import { guessCurrencyFromLocale } from "./currencies";
import { DEFAULT_SUB_SPLIT, RULE_PRESETS } from "./rules";
import type { BudgetState, TabId } from "./types";

const BUDGET_KEY = "budgetsmart:budget:v1";
const TAB_KEY = "budgetsmart:tab";
const THEME_COOKIE = "budgetsmart-theme";

export function defaultBudgetState(): BudgetState {
  const preset = RULE_PRESETS[0];
  return {
    currency: guessCurrencyFromLocale(),
    income: 0,
    ruleId: preset.id,
    customSplit: {
      needsPct: preset.needsPct,
      wantsPct: preset.wantsPct,
      savingsPct: preset.savingsPct,
    },
    subSplit: { ...DEFAULT_SUB_SPLIT },
    items: emptyCategoryItems(),
  };
}

function isBudgetStateShape(value: unknown): value is BudgetState {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.currency === "string" &&
    typeof v.income === "number" &&
    typeof v.ruleId === "string" &&
    typeof v.customSplit === "object" &&
    typeof v.subSplit === "object" &&
    typeof v.items === "object"
  );
}

export function loadBudgetState(): BudgetState {
  const fallback = defaultBudgetState();
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(BUDGET_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (!isBudgetStateShape(parsed)) return fallback;
    return {
      ...fallback,
      ...parsed,
      customSplit: { ...fallback.customSplit, ...parsed.customSplit },
      subSplit: { ...fallback.subSplit, ...parsed.subSplit },
      items: { ...fallback.items, ...parsed.items },
    };
  } catch {
    return fallback;
  }
}

export function saveBudgetState(state: BudgetState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(BUDGET_KEY, JSON.stringify(state));
  } catch {
    // localStorage unavailable (private mode, quota, etc.) — silently skip persistence.
  }
}

export function clearBudgetState(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(BUDGET_KEY);
  } catch {
    // ignore
  }
}

export function loadActiveTab(): TabId {
  if (typeof window === "undefined") return "setup";
  try {
    const tab = window.sessionStorage.getItem(TAB_KEY);
    if (tab === "setup" || tab === "categories" || tab === "results") return tab;
  } catch {
    // ignore
  }
  return "setup";
}

export function saveActiveTab(tab: TabId): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(TAB_KEY, tab);
  } catch {
    // ignore
  }
}

export type Theme = "light" | "dark";

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function setCookie(name: string, value: string, days = 365): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${days * 24 * 60 * 60}; SameSite=Lax`;
}

export function loadTheme(): Theme {
  const stored = getCookie(THEME_COOKIE);
  if (stored === "dark" || stored === "light") return stored;
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return "light";
}

export function saveTheme(theme: Theme): void {
  setCookie(THEME_COOKIE, theme);
}

export const THEME_COOKIE_NAME = THEME_COOKIE;
