"use client";

import { useEffect, useState } from "react";
import { ChartPie, LayoutGrid, LineChart, RotateCcw, SlidersHorizontal, Wallet } from "lucide-react";
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
import { LoanProvider, useLoan } from "@/context/LoanContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { APP_MAX_WIDTH, type ModuleId } from "@/lib/constants";
import type { LoanTabId } from "@/lib/loan/types";
import {
  loadActiveModule,
  loadActiveTab,
  loadLoanTab,
  saveActiveModule,
  saveActiveTab,
  saveLoanTab,
} from "@/lib/storage";
import type { TabId } from "@/lib/types";
import { BottomNav, type NavTab } from "./BottomNav";
import { InstallPrompt } from "./InstallPrompt";
import { NavSheet } from "./NavSheet";
import { OnlineStatusBanner } from "./OnlineStatusBanner";
import { ThemeToggle } from "./ThemeToggle";
import { BudgetModule } from "./budget/BudgetModule";
import { LoanModule } from "./loan/LoanModule";

const BUDGET_TABS: NavTab<TabId>[] = [
  { id: "setup", label: "Setup", icon: SlidersHorizontal },
  { id: "categories", label: "Categories", icon: LayoutGrid },
  { id: "results", label: "Results", icon: ChartPie },
];

const LOAN_TABS: NavTab<LoanTabId>[] = [
  { id: "setup", label: "Setup", icon: SlidersHorizontal },
  { id: "results", label: "Results", icon: LineChart },
];

const BUDGET_HEADER: Record<TabId, { title: string; subtitle: string }> = {
  setup: { title: "BudgetSmart", subtitle: "Income, currency and rule" },
  categories: { title: "Fixed Costs", subtitle: "Add items and set priorities" },
  results: { title: "Your Split", subtitle: "Chart, report and downloads" },
};

const LOAN_HEADER: Record<LoanTabId, { title: string; subtitle: string }> = {
  setup: { title: "Loan Repayment", subtitle: "Loan details and scenario" },
  results: { title: "Payoff Plan", subtitle: "Schedule, chart and CSV" },
};

function Shell() {
  const [activeModule, setActiveModule] = useState<ModuleId>(() => loadActiveModule());
  const [budgetTab, setBudgetTab] = useState<TabId>(() => loadActiveTab());
  const [loanTab, setLoanTab] = useState<LoanTabId>(() => loadLoanTab());
  const { resetAll: resetBudget } = useBudget();
  const { resetAll: resetLoan } = useLoan();

  useEffect(() => {
    saveActiveModule(activeModule);
  }, [activeModule]);
  useEffect(() => {
    saveActiveTab(budgetTab);
  }, [budgetTab]);
  useEffect(() => {
    saveLoanTab(loanTab);
  }, [loanTab]);

  const isBudget = activeModule === "budget";
  const header = isBudget ? BUDGET_HEADER[budgetTab] : LOAN_HEADER[loanTab];

  function handleReset() {
    if (isBudget) resetBudget();
    else resetLoan();
  }

  return (
    <div className={`mx-auto flex min-h-dvh w-full ${APP_MAX_WIDTH} flex-col bg-background`}>
      <OnlineStatusBanner />

      <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border bg-background/95 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 backdrop-blur">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Wallet size={17} strokeWidth={2.2} />
          </span>
          <div key={header.title} className="min-w-0 animate-in fade-in-0 duration-200">
            <h1 className="truncate text-base font-semibold leading-tight text-foreground">{header.title}</h1>
            <p className="truncate text-xs leading-tight text-muted-foreground">{header.subtitle}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label={isBudget ? "Reset budget" : "Reset loan"}
                className="h-10 w-10 rounded-full"
              >
                <RotateCcw size={16} />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{isBudget ? "Reset all budget data" : "Reset all loan data"}</AlertDialogTitle>
                <AlertDialogDescription>
                  {isBudget
                    ? "This clears your income, rule, and every item you have entered. It cannot be undone."
                    : "This clears your loan details and scenario. It cannot be undone."}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction variant="destructive" onClick={handleReset}>
                  Reset
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <ThemeToggle />
          <NavSheet activeModule={activeModule} onSelect={setActiveModule} />
        </div>
      </header>

      <main className="flex-1 px-4 pt-4 pb-24">
        <InstallPrompt />
        <div
          key={activeModule + (isBudget ? budgetTab : loanTab)}
          className="animate-in fade-in-0 slide-in-from-bottom-1 duration-200 ease-out"
        >
          {isBudget ? <BudgetModule activeTab={budgetTab} /> : <LoanModule activeTab={loanTab} />}
        </div>
      </main>

      {isBudget ? (
        <BottomNav tabs={BUDGET_TABS} active={budgetTab} onChange={setBudgetTab} />
      ) : (
        <BottomNav tabs={LOAN_TABS} active={loanTab} onChange={setLoanTab} />
      )}
    </div>
  );
}

export default function AppShell() {
  return (
    <ThemeProvider>
      <BudgetProvider>
        <LoanProvider>
          <Shell />
        </LoanProvider>
      </BudgetProvider>
    </ThemeProvider>
  );
}
