import { CATEGORY_META, CATEGORY_ORDER } from "./categories";
import { getGroupSplit } from "./rules";
import type {
  BudgetState,
  CalculationResult,
  CategoryId,
  CategoryResult,
  ItemResult,
} from "./types";

interface CategoryPercents {
  debt: number;
  essential: number;
  leisure: number;
  shortTerm: number;
  longTerm: number;
}

function expandCategoryPercents(state: BudgetState): CategoryPercents {
  const split = getGroupSplit(state.ruleId, state.customSplit);
  const { debtShareOfNeeds, shortShareOfSavings } = state.subSplit;
  return {
    debt: split.needsPct * debtShareOfNeeds,
    essential: split.needsPct * (1 - debtShareOfNeeds),
    leisure: split.wantsPct,
    shortTerm: split.savingsPct * shortShareOfSavings,
    longTerm: split.savingsPct * (1 - shortShareOfSavings),
  };
}

function sumItems(state: BudgetState, id: CategoryId): number {
  return (state.items[id] ?? []).reduce((sum, item) => sum + item.amount, 0);
}

function hasItems(state: BudgetState, id: CategoryId): boolean {
  return (state.items[id] ?? []).length > 0;
}

/** Mandatory category: items (if any) are always funded in full. */
function buildMandatoryCategory(
  state: BudgetState,
  id: CategoryId,
  allocated: number,
  targetPct: number
): CategoryResult {
  const label = CATEGORY_META[id].label;
  if (hasItems(state, id)) {
    const items: ItemResult[] = state.items[id].map((item) => ({
      id: item.id,
      name: item.name,
      amount: item.amount,
      funded: item.amount,
      cut: false,
    }));
    return { id, label, targetPct, allocated, mode: "itemized", items };
  }
  return { id, label, targetPct, allocated, mode: "spendingPower" };
}

/**
 * Flexible category: items are funded in priority order (array order = priority,
 * highest first) for their full amount, until the pool runs out. The first item
 * that doesn't fully fit — and every lower-priority item after it — is cut to zero.
 */
function buildFlexCategory(
  state: BudgetState,
  id: CategoryId,
  pool: number,
  targetPct: number
): CategoryResult {
  const label = CATEGORY_META[id].label;
  if (hasItems(state, id)) {
    let remainingPool = pool;
    let cutoffReached = false;
    const items: ItemResult[] = state.items[id].map((item) => {
      if (!cutoffReached && item.amount <= remainingPool + 1e-9) {
        remainingPool -= item.amount;
        return { id: item.id, name: item.name, amount: item.amount, funded: item.amount, cut: false };
      }
      cutoffReached = true;
      return { id: item.id, name: item.name, amount: item.amount, funded: 0, cut: true };
    });
    return { id, label, targetPct, allocated: pool, mode: "itemized", items, unallocated: remainingPool };
  }
  return { id, label, targetPct, allocated: pool, mode: "spendingPower" };
}

export function calculateBudget(state: BudgetState): CalculationResult {
  const income = Math.max(state.income, 0);
  const pct = expandCategoryPercents(state);

  const debtAlloc = hasItems(state, "debt") ? sumItems(state, "debt") : (income * pct.debt) / 100;
  const essentialAlloc = hasItems(state, "essential")
    ? sumItems(state, "essential")
    : (income * pct.essential) / 100;

  const mandatoryTotal = debtAlloc + essentialAlloc;
  const remainingAfterMandatory = income - mandatoryTotal;
  const deficit = remainingAfterMandatory < -1e-9;
  const shortfall = deficit ? -remainingAfterMandatory : 0;
  const flexRemaining = Math.max(remainingAfterMandatory, 0);

  const flexShareTotal = pct.leisure + pct.shortTerm + pct.longTerm;
  const leisurePool = flexShareTotal > 0 ? (flexRemaining * pct.leisure) / flexShareTotal : 0;
  const shortPool = flexShareTotal > 0 ? (flexRemaining * pct.shortTerm) / flexShareTotal : 0;
  const longPool = flexShareTotal > 0 ? (flexRemaining * pct.longTerm) / flexShareTotal : 0;

  const categories: CategoryResult[] = [
    buildMandatoryCategory(state, "debt", debtAlloc, pct.debt),
    buildMandatoryCategory(state, "essential", essentialAlloc, pct.essential),
    buildFlexCategory(state, "leisure", leisurePool, pct.leisure),
    buildFlexCategory(state, "shortTerm", shortPool, pct.shortTerm),
    buildFlexCategory(state, "longTerm", longPool, pct.longTerm),
  ];

  const totalAllocated = categories.reduce((sum, c) => sum + c.allocated, 0);

  return {
    income,
    currency: state.currency,
    categories,
    mandatoryTotal,
    remainingAfterMandatory,
    deficit,
    shortfall,
    totalAllocated,
  };
}

export function categoryById(result: CalculationResult, id: CategoryId): CategoryResult {
  return result.categories.find((c) => c.id === id) ?? result.categories[CATEGORY_ORDER.indexOf(id)];
}
