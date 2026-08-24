"use client";

import { useState } from "react";
import { Banknote, ChevronDown, ListTree, Settings2, Wallet } from "lucide-react";
import { useBudget } from "@/context/BudgetContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { CURRENCIES, currencySymbol } from "@/lib/currencies";
import { RuleSelector } from "./RuleSelector";

function SectionHeading({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Wallet;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-2.5 px-1">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
        <Icon size={15} strokeWidth={2.2} />
      </span>
      <div>
        <h2 className="text-lg font-semibold leading-tight text-foreground">{title}</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export function SetupPanel() {
  const { state, setCurrency, setIncome, setSubSplit } = useBudget();
  const [advancedOpen, setAdvancedOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6 pb-6">
      <SectionHeading
        icon={Wallet}
        title="Income and currency"
        description="Everything is entered and shown in one currency."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="currency-select">Currency</Label>
          <Select value={state.currency} onValueChange={setCurrency}>
            <SelectTrigger id="currency-select" className="h-10 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.code} · {c.name} ({c.symbol})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="income-input">Monthly income (after tax)</Label>
          <div className="flex h-10 items-center gap-2 rounded-lg border border-input bg-transparent px-3 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 dark:bg-input/30">
            <Banknote size={16} className="shrink-0 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{currencySymbol(state.currency)}</span>
            <Input
              id="income-input"
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={state.income === 0 ? "" : state.income}
              onChange={(e) => setIncome(parseFloat(e.target.value) || 0)}
              placeholder="0"
              className="h-full border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
            />
          </div>
        </div>
      </div>

      <SectionHeading
        icon={ListTree}
        title="Budgeting rule"
        description="Choose how your income splits across Needs, Wants and Savings."
      />
      <RuleSelector />

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <button
          type="button"
          onClick={() => setAdvancedOpen((o) => !o)}
          className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm font-medium text-foreground"
        >
          <Settings2 size={15} className="shrink-0 text-muted-foreground" />
          <span className="flex-1">Advanced settings</span>
          <ChevronDown
            size={15}
            className={`shrink-0 text-muted-foreground transition-transform duration-200 ${advancedOpen ? "rotate-180" : ""}`}
          />
        </button>
        {advancedOpen && (
          <div className="border-t border-border px-4 py-3.5 text-sm">
            <p className="text-xs text-muted-foreground">
              Controls how the Needs and Savings groups split between their two categories
              when you have not entered items for them yet.
            </p>
            <div className="mt-3">
              <div className="flex items-center justify-between">
                <span className="text-foreground">Debt share of Needs</span>
                <span className="tabular-nums text-muted-foreground">
                  {(state.subSplit.debtShareOfNeeds * 100).toFixed(0)}%
                </span>
              </div>
              <Slider
                className="mt-2"
                min={0}
                max={100}
                step={1}
                value={[state.subSplit.debtShareOfNeeds * 100]}
                onValueChange={([next]) =>
                  setSubSplit({ ...state.subSplit, debtShareOfNeeds: next / 100 })
                }
              />
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <span className="text-foreground">Short term share of Savings</span>
                <span className="tabular-nums text-muted-foreground">
                  {(state.subSplit.shortShareOfSavings * 100).toFixed(0)}%
                </span>
              </div>
              <Slider
                className="mt-2"
                min={0}
                max={100}
                step={1}
                value={[state.subSplit.shortShareOfSavings * 100]}
                onValueChange={([next]) =>
                  setSubSplit({ ...state.subSplit, shortShareOfSavings: next / 100 })
                }
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
