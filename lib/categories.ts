import type { CategoryId, CategoryMeta } from "./types";

export const CATEGORY_ORDER: CategoryId[] = [
  "debt",
  "essential",
  "leisure",
  "shortTerm",
  "longTerm",
];

export const CATEGORY_META: Record<CategoryId, CategoryMeta> = {
  debt: {
    id: "debt",
    label: "Debt",
    shortLabel: "Debt",
    group: "needs",
    mandatory: true,
    description: "Loan, credit card, or other debt repayments. Always paid in full first.",
  },
  essential: {
    id: "essential",
    label: "Essential Expenses",
    shortLabel: "Essentials",
    group: "needs",
    mandatory: true,
    description: "Rent, bills, food, and other costs you can't avoid. Always paid in full.",
  },
  leisure: {
    id: "leisure",
    label: "Leisure",
    shortLabel: "Leisure",
    group: "wants",
    mandatory: false,
    description: "Eating out, entertainment, hobbies. Funded by priority if money is tight.",
  },
  shortTerm: {
    id: "shortTerm",
    label: "Short Term Savings",
    shortLabel: "Short Term",
    group: "savings",
    mandatory: false,
    description: "Emergency fund, upcoming purchases. Funded by priority if money is tight.",
  },
  longTerm: {
    id: "longTerm",
    label: "Long Term Savings",
    shortLabel: "Long Term",
    group: "savings",
    mandatory: false,
    description: "Retirement, investing. Funded by priority if money is tight.",
  },
};

export function emptyCategoryItems() {
  return {
    debt: [],
    essential: [],
    leisure: [],
    shortTerm: [],
    longTerm: [],
  };
}
