"use client";

import type { TabId } from "@/lib/types";
import { CategoriesPanel } from "../categories/CategoriesPanel";
import { ResultsPanel } from "../results/ResultsPanel";
import { SetupPanel } from "../setup/SetupPanel";

export function BudgetModule({ activeTab }: { activeTab: TabId }) {
  if (activeTab === "setup") return <SetupPanel />;
  if (activeTab === "categories") return <CategoriesPanel />;
  return <ResultsPanel />;
}
