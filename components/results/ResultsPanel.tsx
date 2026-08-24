"use client";

import { useMemo } from "react";
import { CircleCheck, TriangleAlert, Wallet } from "lucide-react";
import { useBudget } from "@/context/BudgetContext";
import { generateAsciiReport } from "@/lib/report";
import { AsciiReport } from "./AsciiReport";
import { PieChart } from "./PieChart";

export function ResultsPanel() {
  const { state, result } = useBudget();
  const reportText = useMemo(() => generateAsciiReport(result), [result]);

  if (state.income <= 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border px-6 py-14 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Wallet size={22} />
        </span>
        <div>
          <p className="text-sm font-medium text-foreground">No income set yet</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Add your monthly income in the Setup tab to see your split.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pb-6">
      {result.deficit ? (
        <div className="flex items-start gap-2.5 rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3">
          <TriangleAlert size={18} className="mt-0.5 shrink-0 text-destructive" />
          <div>
            <p className="text-sm font-semibold text-destructive">Over budget</p>
            <p className="mt-0.5 text-sm text-destructive/90">
              Your Debt and Essential costs alone exceed your income. Flexible categories
              are at zero. See the report below for details.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2.5 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-2.5">
          <CircleCheck size={17} className="shrink-0 text-primary" />
          <p className="text-sm font-medium text-primary">Your budget balances. Every dollar is placed.</p>
        </div>
      )}
      <PieChart result={result} />
      <AsciiReport reportText={reportText} />
    </div>
  );
}
