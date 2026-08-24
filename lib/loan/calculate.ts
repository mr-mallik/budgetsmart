import { addMonths, fullMonthsBetween, parseIsoDate, toIsoDate, yearsBetweenAsMonths } from "./dates";
import type {
  InterestMethod,
  LoanCalculationResult,
  LoanState,
  ScheduleRow,
  ScheduleSummary,
} from "./types";

const MAX_MONTHS = 1200; // 100 years, a hard safety cap against runaway loops

export function monthlyRate(annualRatePct: number): number {
  return annualRatePct / 100 / 12;
}

/** Standard reducing-balance EMI formula. */
export function emiReducing(principal: number, months: number, rate: number): number {
  if (months <= 0) return 0;
  if (rate === 0) return principal / months;
  const factor = Math.pow(1 + rate, months);
  return (principal * rate * factor) / (factor - 1);
}

/** Fractional number of months to pay off `principal` at `emi` per month, reducing balance. Null if emi never covers interest. */
export function solveTenureReducing(principal: number, emi: number, rate: number): number | null {
  if (rate === 0) return principal / emi;
  const monthlyInterest = principal * rate;
  if (emi <= monthlyInterest) return null;
  return -Math.log(1 - monthlyInterest / emi) / Math.log(1 + rate);
}

/** Flat/simple interest: total interest is fixed upfront on the original principal, spread evenly. */
export function emiFlat(principal: number, months: number, annualRatePct: number): number {
  if (months <= 0) return 0;
  const totalInterest = principal * (annualRatePct / 100) * (months / 12);
  return (principal + totalInterest) / months;
}

export function solveTenureFlat(principal: number, emi: number, annualRatePct: number): number | null {
  const monthlyFlatInterest = (principal * (annualRatePct / 100)) / 12;
  if (emi <= monthlyFlatInterest) return null;
  return principal / (emi - monthlyFlatInterest);
}

export function minimumEmiFor(principal: number, annualRatePct: number, method: InterestMethod): number {
  return method === "reducing" ? principal * monthlyRate(annualRatePct) : (principal * (annualRatePct / 100)) / 12;
}

function summarize(rows: ScheduleRow[]): ScheduleSummary {
  const totalInterest = rows.reduce((s, r) => s + r.interest, 0);
  const totalPrincipal = rows.reduce((s, r) => s + r.principal, 0);
  const totalPaid = rows.reduce((s, r) => s + r.emi, 0);
  return {
    emi: rows[0]?.emi ?? 0,
    months: rows.length,
    totalInterest,
    totalPrincipal,
    totalPaid,
    payoffDate: rows[rows.length - 1]?.date ?? "",
    rows,
  };
}

/**
 * Simulates a reducing-balance schedule row by row using a fixed EMI. The
 * final row is trimmed to exactly close the balance (handles both a
 * formula-derived EMI with float residue, and a user-chosen EMI whose
 * final payment is naturally smaller than the regular EMI).
 */
function buildReducingSchedule(
  principal: number,
  emi: number,
  rate: number,
  startDate: Date,
  lumpSum?: { amount: number; count: number; intervalMonths: number }
): ScheduleRow[] {
  const rows: ScheduleRow[] = [];
  let balance = principal;
  let lumpSumsApplied = 0;

  for (let k = 1; k <= MAX_MONTHS && balance > 0.005; k++) {
    const opening = balance;
    const interest = opening * rate;
    let principalPortion = emi - interest;
    let emiThisRow = emi;

    if (principalPortion >= opening) {
      principalPortion = opening;
      emiThisRow = principalPortion + interest;
    }

    balance = opening - principalPortion;

    let lumpSumApplied: number | undefined;
    if (
      lumpSum &&
      lumpSum.intervalMonths > 0 &&
      lumpSumsApplied < lumpSum.count &&
      k % lumpSum.intervalMonths === 0 &&
      balance > 0.005
    ) {
      lumpSumApplied = Math.min(lumpSum.amount, balance);
      balance -= lumpSumApplied;
      lumpSumsApplied += 1;
    }

    rows.push({
      index: k,
      date: toIsoDate(addMonths(startDate, k - 1)),
      opening,
      emi: emiThisRow,
      interest,
      principal: principalPortion + (lumpSumApplied ?? 0),
      closing: Math.max(balance, 0),
      lumpSumApplied,
    });
  }

  return rows;
}

function buildFlatSchedule(principal: number, months: number, annualRatePct: number, startDate: Date): ScheduleRow[] {
  const rows: ScheduleRow[] = [];
  const monthlyInterest = (principal * (annualRatePct / 100)) / 12;
  const monthlyPrincipal = principal / months;
  let balance = principal;

  for (let k = 1; k <= months; k++) {
    const opening = balance;
    const isLast = k === months;
    const principalPortion = isLast ? opening : monthlyPrincipal;
    balance = opening - principalPortion;
    rows.push({
      index: k,
      date: toIsoDate(addMonths(startDate, k - 1)),
      opening,
      emi: principalPortion + monthlyInterest,
      interest: monthlyInterest,
      principal: principalPortion,
      closing: Math.max(balance, 0),
    });
  }

  return rows;
}

export function calculateLoan(state: LoanState, today: Date = new Date()): LoanCalculationResult {
  const principal = Math.max(state.principal, 0);
  const rate = monthlyRate(state.annualRatePct);
  const firstEmiDate = parseIsoDate(state.firstEmiDate);

  const originalTotalMonths =
    state.tenureMode === "years"
      ? yearsBetweenAsMonths(state.tenureYears)
      : fullMonthsBetween(firstEmiDate, parseIsoDate(state.lastEmiDate)) + 1;

  const elapsedPayments = Math.min(Math.max(fullMonthsBetween(firstEmiDate, today) + 1, 0), originalTotalMonths);
  const originalRemainingMonths = originalTotalMonths - elapsedPayments;
  const scheduleStartDate = addMonths(firstEmiDate, elapsedPayments);

  if (originalRemainingMonths <= 0 || principal <= 0) {
    return {
      currency: state.currency,
      principal,
      originalTotalMonths,
      elapsedPayments,
      originalRemainingMonths,
      scheduleStartDate: toIsoDate(scheduleStartDate),
      issue: principal <= 0 ? { type: "none" } : { type: "alreadyFinished" },
      original: null,
      revised: null,
    };
  }

  const original =
    state.interestMethod === "reducing"
      ? summarize(
          buildReducingSchedule(principal, emiReducing(principal, originalRemainingMonths, rate), rate, scheduleStartDate)
        )
      : summarize(buildFlatSchedule(principal, originalRemainingMonths, state.annualRatePct, scheduleStartDate));

  let revised: ScheduleSummary | null = null;
  let issue: LoanCalculationResult["issue"] = { type: "none" };

  if (state.scenarioMode === "targetTenure") {
    const months = Math.max(yearsBetweenAsMonths(state.targetTenureYears), 1);
    revised =
      state.interestMethod === "reducing"
        ? summarize(buildReducingSchedule(principal, emiReducing(principal, months, rate), rate, scheduleStartDate))
        : summarize(buildFlatSchedule(principal, months, state.annualRatePct, scheduleStartDate));
  } else if (state.scenarioMode === "targetEmi") {
    const minEmi = minimumEmiFor(principal, state.annualRatePct, state.interestMethod);
    if (state.targetEmi <= minEmi) {
      issue = { type: "emiTooLow", minimumEmi: minEmi };
    } else if (state.interestMethod === "reducing") {
      revised = summarize(buildReducingSchedule(principal, state.targetEmi, rate, scheduleStartDate));
    } else {
      const months = solveTenureFlat(principal, state.targetEmi, state.annualRatePct);
      const wholeMonths = Math.max(Math.ceil(months ?? 1), 1);
      revised = summarize(buildFlatSchedule(principal, wholeMonths, state.annualRatePct, scheduleStartDate));
    }
  } else if (state.interestMethod === "reducing") {
    // lumpSum mode: reducing balance only, EMI held at the original amount.
    const baseEmi = original.emi;
    revised = summarize(buildReducingSchedule(principal, baseEmi, rate, scheduleStartDate, state.lumpSum));
  } else {
    // Lump sum prepayments aren't supported with flat interest; fall back to the
    // unchanged original plan rather than mixing interest methods.
    revised = original;
  }

  return {
    currency: state.currency,
    principal,
    originalTotalMonths,
    elapsedPayments,
    originalRemainingMonths,
    scheduleStartDate: toIsoDate(scheduleStartDate),
    issue,
    original,
    revised,
  };
}
