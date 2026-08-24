"use client";

import { Banknote, CalendarClock, Landmark, ListTree, Percent, Target } from "lucide-react";
import { useLoan } from "@/context/LoanContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CURRENCIES, currencySymbol } from "@/lib/currencies";
import type { InterestMethod, ScenarioMode, TenureMode } from "@/lib/loan/types";

function SectionHeading({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Landmark;
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
  const { state, setField, setLumpSum } = useLoan();

  return (
    <div className="flex flex-col gap-6 pb-6">
      <SectionHeading icon={Landmark} title="Loan details" description="Your loan as it stands today." />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="loan-currency">Currency</Label>
          <Select value={state.currency} onValueChange={(v) => setField("currency", v)}>
            <SelectTrigger id="loan-currency" className="h-10 w-full">
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
          <Label htmlFor="loan-principal">Principal outstanding today</Label>
          <div className="flex h-10 items-center gap-2 rounded-lg border border-input bg-transparent px-3 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 dark:bg-input/30">
            <Banknote size={16} className="shrink-0 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{currencySymbol(state.currency)}</span>
            <Input
              id="loan-principal"
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={state.principal === 0 ? "" : state.principal}
              onChange={(e) => setField("principal", parseFloat(e.target.value) || 0)}
              placeholder="0"
              className="h-full border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="loan-rate">Annual interest rate</Label>
          <div className="flex h-10 items-center gap-2 rounded-lg border border-input bg-transparent px-3 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 dark:bg-input/30">
            <Percent size={16} className="shrink-0 text-muted-foreground" />
            <Input
              id="loan-rate"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.05"
              value={state.annualRatePct === 0 ? "" : state.annualRatePct}
              onChange={(e) => setField("annualRatePct", parseFloat(e.target.value) || 0)}
              placeholder="0"
              className="h-full border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="loan-first-emi">Date of first EMI</Label>
          <Input
            id="loan-first-emi"
            type="date"
            value={state.firstEmiDate}
            onChange={(e) => setField("firstEmiDate", e.target.value)}
            className="h-10 w-full"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card px-4 py-3.5 shadow-sm">
        <p className="text-sm font-medium text-foreground">Original loan length</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          How long the loan was originally planned for, measured from the first EMI.
        </p>
        <RadioGroup
          value={state.tenureMode}
          onValueChange={(v) => setField("tenureMode", v as TenureMode)}
          className="mt-3 grid grid-cols-2 gap-2"
        >
          <label
            htmlFor="tenure-years"
            className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-colors ${
              state.tenureMode === "years" ? "border-primary bg-primary/10" : "border-border"
            }`}
          >
            <RadioGroupItem value="years" id="tenure-years" />
            Tenure in years
          </label>
          <label
            htmlFor="tenure-end-date"
            className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-colors ${
              state.tenureMode === "endDate" ? "border-primary bg-primary/10" : "border-border"
            }`}
          >
            <RadioGroupItem value="endDate" id="tenure-end-date" />
            Last EMI date
          </label>
        </RadioGroup>

        {state.tenureMode === "years" ? (
          <div className="mt-3 flex flex-col gap-1.5">
            <Label htmlFor="loan-tenure-years">Original tenure (years)</Label>
            <Input
              id="loan-tenure-years"
              type="number"
              inputMode="decimal"
              min="0.5"
              step="0.5"
              value={state.tenureYears}
              onChange={(e) => setField("tenureYears", parseFloat(e.target.value) || 0)}
              className="h-10"
            />
          </div>
        ) : (
          <div className="mt-3 flex flex-col gap-1.5">
            <Label htmlFor="loan-last-emi">Original last EMI date</Label>
            <Input
              id="loan-last-emi"
              type="date"
              value={state.lastEmiDate}
              onChange={(e) => setField("lastEmiDate", e.target.value)}
              className="h-10"
            />
          </div>
        )}
      </div>

      <SectionHeading icon={ListTree} title="Interest method" description="How interest is calculated each month." />
      <RadioGroup
        value={state.interestMethod}
        onValueChange={(v) => {
          setField("interestMethod", v as InterestMethod);
          if (v === "flat" && state.scenarioMode === "lumpSum") setField("scenarioMode", "targetTenure");
        }}
        className="grid grid-cols-1 gap-2.5 sm:grid-cols-2"
      >
        <label
          htmlFor="method-reducing"
          className={`flex cursor-pointer items-start gap-2.5 rounded-2xl border px-3.5 py-3 text-left transition-all active:scale-[0.98] ${
            state.interestMethod === "reducing" ? "border-primary bg-primary/10 shadow-sm" : "border-border bg-card"
          }`}
        >
          <RadioGroupItem value="reducing" id="method-reducing" className="mt-0.5" />
          <span>
            <p className="text-sm font-semibold text-foreground">Reducing balance</p>
            <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
              Interest is charged on what is still owed. The standard bank loan model.
            </p>
          </span>
        </label>
        <label
          htmlFor="method-flat"
          className={`flex cursor-pointer items-start gap-2.5 rounded-2xl border px-3.5 py-3 text-left transition-all active:scale-[0.98] ${
            state.interestMethod === "flat" ? "border-primary bg-primary/10 shadow-sm" : "border-border bg-card"
          }`}
        >
          <RadioGroupItem value="flat" id="method-flat" className="mt-0.5" />
          <span>
            <p className="text-sm font-semibold text-foreground">Simple (flat)</p>
            <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
              Interest is fixed upfront on the original principal and spread evenly.
            </p>
          </span>
        </label>
      </RadioGroup>

      <SectionHeading icon={Target} title="What do you want to know" description="Pick a scenario to plan against." />
      <RadioGroup
        value={state.scenarioMode}
        onValueChange={(v) => setField("scenarioMode", v as ScenarioMode)}
        className="flex flex-col gap-2.5"
      >
        <label
          htmlFor="scenario-tenure"
          className={`flex cursor-pointer items-start gap-2.5 rounded-2xl border px-3.5 py-3 text-left transition-all active:scale-[0.98] ${
            state.scenarioMode === "targetTenure" ? "border-primary bg-primary/10 shadow-sm" : "border-border bg-card"
          }`}
        >
          <RadioGroupItem value="targetTenure" id="scenario-tenure" className="mt-0.5" />
          <span className="flex-1">
            <p className="text-sm font-semibold text-foreground">Finish in a set number of years</p>
            <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
              Tell me the new EMI needed to pay this off in X years.
            </p>
            {state.scenarioMode === "targetTenure" && (
              <Input
                type="number"
                inputMode="decimal"
                min="0.5"
                step="0.5"
                value={state.targetTenureYears}
                onChange={(e) => setField("targetTenureYears", parseFloat(e.target.value) || 0)}
                className="mt-2 h-10 max-w-40"
                aria-label="Target tenure in years"
              />
            )}
          </span>
        </label>

        <label
          htmlFor="scenario-emi"
          className={`flex cursor-pointer items-start gap-2.5 rounded-2xl border px-3.5 py-3 text-left transition-all active:scale-[0.98] ${
            state.scenarioMode === "targetEmi" ? "border-primary bg-primary/10 shadow-sm" : "border-border bg-card"
          }`}
        >
          <RadioGroupItem value="targetEmi" id="scenario-emi" className="mt-0.5" />
          <span className="flex-1">
            <p className="text-sm font-semibold text-foreground">Pay a fixed amount every month</p>
            <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
              Tell me how long it takes if I pay X every month.
            </p>
            {state.scenarioMode === "targetEmi" && (
              <div className="mt-2 flex h-10 max-w-40 items-center gap-2 rounded-lg border border-input bg-transparent px-3 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 dark:bg-input/30">
                <span className="text-sm text-muted-foreground">{currencySymbol(state.currency)}</span>
                <Input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="1"
                  value={state.targetEmi === 0 ? "" : state.targetEmi}
                  onChange={(e) => setField("targetEmi", parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="h-full border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
                  aria-label="Target monthly EMI"
                />
              </div>
            )}
          </span>
        </label>

        <label
          htmlFor="scenario-lumpsum"
          className={`flex items-start gap-2.5 rounded-2xl border px-3.5 py-3 text-left transition-all ${
            state.interestMethod === "flat" ? "cursor-not-allowed opacity-50" : "cursor-pointer active:scale-[0.98]"
          } ${state.scenarioMode === "lumpSum" ? "border-primary bg-primary/10 shadow-sm" : "border-border bg-card"}`}
        >
          <RadioGroupItem
            value="lumpSum"
            id="scenario-lumpsum"
            className="mt-0.5"
            disabled={state.interestMethod === "flat"}
          />
          <span className="flex-1">
            <p className="text-sm font-semibold text-foreground">Make lump sum prepayments</p>
            <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
              {state.interestMethod === "flat"
                ? "Only available with reducing balance interest."
                : "Keep the current EMI, and pay extra lump sums at set intervals."}
            </p>
            {state.scenarioMode === "lumpSum" && state.interestMethod === "reducing" && (
              <div className="mt-2 grid grid-cols-3 gap-2">
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] text-muted-foreground">Amount</span>
                  <Input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="1"
                    value={state.lumpSum.amount === 0 ? "" : state.lumpSum.amount}
                    onChange={(e) => setLumpSum({ ...state.lumpSum, amount: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                    className="h-10"
                    aria-label="Lump sum amount"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] text-muted-foreground">Times</span>
                  <Input
                    type="number"
                    inputMode="numeric"
                    min="1"
                    step="1"
                    value={state.lumpSum.count}
                    onChange={(e) => setLumpSum({ ...state.lumpSum, count: parseInt(e.target.value, 10) || 1 })}
                    className="h-10"
                    aria-label="Number of lump sum payments"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] text-muted-foreground">Every (months)</span>
                  <Input
                    type="number"
                    inputMode="numeric"
                    min="1"
                    step="1"
                    value={state.lumpSum.intervalMonths}
                    onChange={(e) =>
                      setLumpSum({ ...state.lumpSum, intervalMonths: parseInt(e.target.value, 10) || 1 })
                    }
                    className="h-10"
                    aria-label="Interval between lump sum payments, in months"
                  />
                </div>
              </div>
            )}
          </span>
        </label>
      </RadioGroup>

      <div className="flex items-start gap-2.5 rounded-2xl border border-border bg-card px-4 py-3 text-xs text-muted-foreground">
        <CalendarClock size={15} className="mt-0.5 shrink-0" />
        <p>
          Both the original and revised schedules are calculated from today, using your current outstanding
          principal.
        </p>
      </div>
    </div>
  );
}
