"use client";

import { CircleCheck, SlidersHorizontal } from "lucide-react";
import { useBudget } from "@/context/BudgetContext";
import { Slider } from "@/components/ui/slider";
import { rebalanceTriple } from "@/lib/rebalance";
import { CUSTOM_RULE_ID, RULE_PRESETS, getGroupSplit } from "@/lib/rules";

const GROUP_LABELS: [string, string, string] = ["Needs", "Wants", "Savings"];

export function RuleSelector() {
  const { state, setRule, setCustomSplit } = useBudget();
  const activeSplit = getGroupSplit(state.ruleId, state.customSplit);
  const isCustom = state.ruleId === CUSTOM_RULE_ID;

  function handleSliderChange(index: 0 | 1 | 2, value: number) {
    const triple: [number, number, number] = [
      activeSplit.needsPct,
      activeSplit.wantsPct,
      activeSplit.savingsPct,
    ];
    const [needsPct, wantsPct, savingsPct] = rebalanceTriple(triple, index, value);
    setCustomSplit({ needsPct, wantsPct, savingsPct });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {RULE_PRESETS.map((preset) => {
          const active = state.ruleId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => setRule(preset.id)}
              className={`relative rounded-2xl border px-3.5 py-3 text-left transition-all active:scale-[0.98] ${
                active
                  ? "border-primary bg-primary/10 shadow-sm"
                  : "border-border bg-card hover:border-primary/40"
              }`}
            >
              {active && (
                <CircleCheck
                  size={16}
                  className="animate-in zoom-in-50 duration-200 absolute right-2.5 top-2.5 text-primary"
                  strokeWidth={2.3}
                  fill="currentColor"
                  fillOpacity={0.15}
                />
              )}
              <p className="pr-5 text-sm font-semibold text-foreground">{preset.name}</p>
              <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{preset.description}</p>
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setRule(CUSTOM_RULE_ID)}
          className={`relative col-span-2 flex items-start gap-2.5 rounded-2xl border px-3.5 py-3 text-left transition-all active:scale-[0.98] sm:col-span-1 ${
            isCustom ? "border-primary bg-primary/10 shadow-sm" : "border-border bg-card hover:border-primary/40"
          }`}
        >
          <span
            className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
              isCustom ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
            }`}
          >
            <SlidersHorizontal size={13} />
          </span>
          <span>
            <p className="text-sm font-semibold text-foreground">Custom split</p>
            <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
              Set your own Needs, Wants and Savings percentages.
            </p>
          </span>
          {isCustom && (
            <CircleCheck
              size={16}
              className="absolute right-2.5 top-2.5 text-primary"
              strokeWidth={2.3}
              fill="currentColor"
              fillOpacity={0.15}
            />
          )}
        </button>
      </div>

      {isCustom && (
        <div className="rounded-2xl border border-border bg-card px-4 py-3.5 shadow-sm">
          {([activeSplit.needsPct, activeSplit.wantsPct, activeSplit.savingsPct] as const).map(
            (val, i) => (
              <div key={GROUP_LABELS[i]} className={i > 0 ? "mt-4" : undefined}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{GROUP_LABELS[i]}</span>
                  <span className="tabular-nums text-muted-foreground">{val.toFixed(1)}%</span>
                </div>
                <Slider
                  className="mt-2"
                  min={0}
                  max={100}
                  step={0.5}
                  value={[val]}
                  onValueChange={([next]) => handleSliderChange(i as 0 | 1 | 2, next)}
                />
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
