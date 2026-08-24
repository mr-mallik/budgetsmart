"use client";

import type { LoanTabId } from "@/lib/loan/types";
import { ResultsPanel } from "./ResultsPanel";
import { SetupPanel } from "./SetupPanel";

export function LoanModule({ activeTab }: { activeTab: LoanTabId }) {
  if (activeTab === "setup") return <SetupPanel />;
  return <ResultsPanel />;
}
