"use client";

import { CircleCheck, Landmark, TriangleAlert } from "lucide-react";
import { useLoan } from "@/context/LoanContext";
import { formatCurrency } from "@/lib/currencies";
import { LineChart } from "./LineChart";
import { PieCharts } from "./PieCharts";
import { ScheduleTable } from "./ScheduleTable";

function StatRow({ label, original, revised }: { label: string; original: string; revised: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-2 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="flex items-center gap-3 tabular-nums">
        <span className="text-muted-foreground">{original}</span>
        <span className="font-semibold text-primary">{revised}</span>
      </span>
    </div>
  );
}

export function ResultsPanel() {
  const { state, result } = useLoan();

  if (state.principal <= 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border px-6 py-14 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Landmark size={22} />
        </span>
        <div>
          <p className="text-sm font-medium text-foreground">No loan details yet</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Add your outstanding principal in the Setup tab to see your payoff plan.
          </p>
        </div>
      </div>
    );
  }

  if (result.issue.type === "alreadyFinished") {
    return (
      <div className="flex items-start gap-2.5 rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3">
        <TriangleAlert size={18} className="mt-0.5 shrink-0 text-destructive" />
        <div>
          <p className="text-sm font-semibold text-destructive">No remaining term</p>
          <p className="mt-0.5 text-sm text-destructive/90">
            Based on the first EMI date and original tenure, this loan should already be finished. Check your
            dates or tenure in the Setup tab.
          </p>
        </div>
      </div>
    );
  }

  const { original, revised } = result;

  return (
    <div className="flex flex-col gap-4 pb-6">
      {result.issue.type === "emiTooLow" && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3">
          <TriangleAlert size={18} className="mt-0.5 shrink-0 text-destructive" />
          <div>
            <p className="text-sm font-semibold text-destructive">EMI too low</p>
            <p className="mt-0.5 text-sm text-destructive/90">
              This EMI does not even cover the monthly interest, so the loan would never pay off. It needs to be
              above {formatCurrency(result.issue.minimumEmi, state.currency)}.
            </p>
          </div>
        </div>
      )}

      {original && revised && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-2.5">
          <CircleCheck size={17} className="shrink-0 text-primary" />
          <p className="text-sm font-medium text-primary">
            {revised.totalInterest < original.totalInterest
              ? `You save ${formatCurrency(original.totalInterest - revised.totalInterest, state.currency)} in interest.`
              : revised.totalInterest > original.totalInterest
                ? `This costs ${formatCurrency(revised.totalInterest - original.totalInterest, state.currency)} more in interest.`
                : "Total interest stays about the same."}
          </p>
        </div>
      )}

      {original && (
        <div className="rounded-2xl border border-border bg-card px-4 py-3 shadow-sm">
          <div className="flex items-center justify-between pb-2 text-xs font-medium text-muted-foreground">
            <span>Metric</span>
            <span className="flex gap-3">
              <span>Original</span>
              <span className="text-primary">Revised</span>
            </span>
          </div>
          <StatRow
            label="Monthly EMI"
            original={formatCurrency(original.emi, state.currency)}
            revised={revised ? formatCurrency(revised.emi, state.currency) : "n/a"}
          />
          <StatRow label="Months remaining" original={`${original.months}`} revised={revised ? `${revised.months}` : "n/a"} />
          <StatRow
            label="Total interest"
            original={formatCurrency(original.totalInterest, state.currency)}
            revised={revised ? formatCurrency(revised.totalInterest, state.currency) : "n/a"}
          />
          <StatRow
            label="Payoff date"
            original={original.payoffDate}
            revised={revised ? revised.payoffDate : "n/a"}
          />
        </div>
      )}

      <LineChart original={original} revised={revised} currency={state.currency} />
      <PieCharts original={original} revised={revised} principal={result.principal} currency={state.currency} />
      {revised && <ScheduleTable schedule={revised} currency={state.currency} />}
    </div>
  );
}
