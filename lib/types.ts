export type CategoryId =
  | "debt"
  | "essential"
  | "leisure"
  | "shortTerm"
  | "longTerm";

export type CategoryGroup = "needs" | "wants" | "savings";

export interface CategoryMeta {
  id: CategoryId;
  label: string;
  shortLabel: string;
  group: CategoryGroup;
  mandatory: boolean;
  description: string;
}

export interface BudgetItem {
  id: string;
  name: string;
  amount: number;
}

export type CategoryItems = Record<CategoryId, BudgetItem[]>;

export interface RulePreset {
  id: string;
  name: string;
  description: string;
  needsPct: number;
  wantsPct: number;
  savingsPct: number;
}

export interface GroupSplit {
  needsPct: number;
  wantsPct: number;
  savingsPct: number;
}

export interface SubSplit {
  /** Share of the Needs group given to Debt, 0..1. Remainder goes to Essential. */
  debtShareOfNeeds: number;
  /** Share of the Savings group given to Short-term, 0..1. Remainder goes to Long-term. */
  shortShareOfSavings: number;
}

export interface BudgetState {
  currency: string;
  income: number;
  ruleId: string;
  customSplit: GroupSplit;
  subSplit: SubSplit;
  items: CategoryItems;
}

export interface ItemResult {
  id: string;
  name: string;
  amount: number;
  funded: number;
  cut: boolean;
}

export interface CategoryResult {
  id: CategoryId;
  label: string;
  targetPct: number;
  allocated: number;
  mode: "spendingPower" | "itemized";
  items?: ItemResult[];
  unallocated?: number;
}

export interface CalculationResult {
  income: number;
  currency: string;
  categories: CategoryResult[];
  mandatoryTotal: number;
  remainingAfterMandatory: number;
  deficit: boolean;
  shortfall: number;
  totalAllocated: number;
}

export type TabId = "setup" | "categories" | "results";
