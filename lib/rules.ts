import type { GroupSplit, RulePreset, SubSplit } from "./types";

export const RULE_PRESETS: RulePreset[] = [
  {
    id: "50-30-20",
    name: "50 / 30 / 20",
    description: "The classic rule: 50% needs, 30% wants, 20% savings.",
    needsPct: 50,
    wantsPct: 30,
    savingsPct: 20,
  },
  {
    id: "60-20-20",
    name: "60 / 20 / 20",
    description: "For higher fixed costs: 60% needs, 20% wants, 20% savings.",
    needsPct: 60,
    wantsPct: 20,
    savingsPct: 20,
  },
  {
    id: "70-20-10",
    name: "70 / 20 / 10",
    description: "Tight budgets: 70% needs, 20% wants, 10% savings.",
    needsPct: 70,
    wantsPct: 20,
    savingsPct: 10,
  },
  {
    id: "40-30-30",
    name: "40 / 30 / 30",
    description: "Aggressive saver: 40% needs, 30% wants, 30% savings.",
    needsPct: 40,
    wantsPct: 30,
    savingsPct: 30,
  },
];

export const CUSTOM_RULE_ID = "custom";

export const DEFAULT_SUB_SPLIT: SubSplit = {
  debtShareOfNeeds: 0.15,
  shortShareOfSavings: 0.5,
};

export function getGroupSplit(
  ruleId: string,
  customSplit: GroupSplit
): GroupSplit {
  if (ruleId === CUSTOM_RULE_ID) return customSplit;
  const preset = RULE_PRESETS.find((p) => p.id === ruleId);
  return preset ?? RULE_PRESETS[0];
}

export function isValidGroupSplit(split: GroupSplit): boolean {
  const total = split.needsPct + split.wantsPct + split.savingsPct;
  return Math.abs(total - 100) < 0.01;
}
