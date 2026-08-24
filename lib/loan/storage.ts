import { guessCurrencyFromLocale } from "../currencies";
import { todayIso } from "./dates";
import type { LoanState } from "./types";

const LOAN_KEY = "budgetsmart:loan:v1";

export function defaultLoanState(): LoanState {
  return {
    currency: guessCurrencyFromLocale(),
    principal: 0,
    annualRatePct: 0,
    firstEmiDate: todayIso(),
    tenureMode: "years",
    lastEmiDate: todayIso(),
    tenureYears: 5,
    interestMethod: "reducing",
    scenarioMode: "targetTenure",
    targetTenureYears: 3,
    targetEmi: 0,
    lumpSum: { amount: 0, count: 1, intervalMonths: 12 },
  };
}

function isLoanStateShape(value: unknown): value is LoanState {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.currency === "string" &&
    typeof v.principal === "number" &&
    typeof v.annualRatePct === "number" &&
    typeof v.firstEmiDate === "string" &&
    typeof v.tenureMode === "string" &&
    typeof v.lumpSum === "object"
  );
}

export function loadLoanState(): LoanState {
  const fallback = defaultLoanState();
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(LOAN_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (!isLoanStateShape(parsed)) return fallback;
    return { ...fallback, ...parsed, lumpSum: { ...fallback.lumpSum, ...parsed.lumpSum } };
  } catch {
    return fallback;
  }
}

export function saveLoanState(state: LoanState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LOAN_KEY, JSON.stringify(state));
  } catch {
    // localStorage unavailable — silently skip persistence.
  }
}
