"use client";

import { useEffect, useState } from "react";
import { RotateCcw, Wallet } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { BudgetProvider, useBudget } from "@/context/BudgetContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { APP_MAX_WIDTH } from "@/lib/constants";
import { loadActiveTab, saveActiveTab } from "@/lib/storage";
import type { TabId } from "@/lib/types";
import { BottomNav } from "./BottomNav";
import { ThemeToggle } from "./ThemeToggle";
import { CategoriesPanel } from "./categories/CategoriesPanel";
import { ResultsPanel } from "./results/ResultsPanel";
import { SetupPanel } from "./setup/SetupPanel";

const TAB_TITLES: Record<TabId, string> = {
  setup: "BudgetSmart",
  categories: "Fixed Costs",
  results: "Your Split",
};

const TAB_SUBTITLES: Record<TabId, string> = {
  setup: "Income, currency and rule",
  categories: "Add items and set priorities",
  results: "Chart, report and downloads",
};

function AppShell() {
  const [activeTab, setActiveTab] = useState<TabId>(() => loadActiveTab());
  const { resetAll } = useBudget();

  useEffect(() => {
    saveActiveTab(activeTab);
  }, [activeTab]);

  return (
    <div className={`mx-auto flex min-h-dvh w-full ${APP_MAX_WIDTH} flex-col bg-background`}>
      <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Wallet size={17} strokeWidth={2.2} />
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold leading-tight text-foreground">
              {TAB_TITLES[activeTab]}
            </h1>
            <p className="truncate text-xs leading-tight text-muted-foreground">{TAB_SUBTITLES[activeTab]}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Reset budget"
                className="h-9 w-9 rounded-full"
              >
                <RotateCcw size={15} />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset all budget data</AlertDialogTitle>
                <AlertDialogDescription>
                  This clears your income, rule, and every item you have entered. It cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction variant="destructive" onClick={() => resetAll()}>
                  Reset
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 px-4 pt-4 pb-24">
        {activeTab === "setup" && <SetupPanel />}
        {activeTab === "categories" && <CategoriesPanel />}
        {activeTab === "results" && <ResultsPanel />}
      </main>

      <BottomNav active={activeTab} onChange={setActiveTab} />
    </div>
  );
}

export default function BudgetApp() {
  return (
    <ThemeProvider>
      <BudgetProvider>
        <AppShell />
      </BudgetProvider>
    </ThemeProvider>
  );
}
