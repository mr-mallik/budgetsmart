export type LoanTabId = "setup" | "results";
export type InterestMethod = "reducing" | "flat";
export type TenureMode = "endDate" | "years";
export type ScenarioMode = "targetTenure" | "targetEmi" | "lumpSum";

export interface LumpSumPlan {
  amount: number;
  count: number;
  intervalMonths: number;
}

export interface LoanState {
  currency: string;
  principal: number;
  annualRatePct: number;
  firstEmiDate: string;
  tenureMode: TenureMode;
  lastEmiDate: string;
  tenureYears: number;
  interestMethod: InterestMethod;
  scenarioMode: ScenarioMode;
  targetTenureYears: number;
  targetEmi: number;
  lumpSum: LumpSumPlan;
}

export interface ScheduleRow {
  index: number;
  date: string;
  opening: number;
  emi: number;
  interest: number;
  principal: number;
  closing: number;
  lumpSumApplied?: number;
}

export interface ScheduleSummary {
  emi: number;
  months: number;
  totalInterest: number;
  totalPrincipal: number;
  totalPaid: number;
  payoffDate: string;
  rows: ScheduleRow[];
}

export type LoanIssue =
  | { type: "alreadyFinished" }
  | { type: "emiTooLow"; minimumEmi: number }
  | { type: "none" };

export interface LoanCalculationResult {
  currency: string;
  principal: number;
  originalTotalMonths: number;
  elapsedPayments: number;
  originalRemainingMonths: number;
  scheduleStartDate: string;
  issue: LoanIssue;
  original: ScheduleSummary | null;
  revised: ScheduleSummary | null;
}
