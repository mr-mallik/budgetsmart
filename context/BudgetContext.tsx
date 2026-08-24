"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import type { ReactNode } from "react";
import { calculateBudget } from "@/lib/calculate";
import { CUSTOM_RULE_ID, getGroupSplit } from "@/lib/rules";
import {
  defaultBudgetState,
  loadBudgetState,
  saveBudgetState,
} from "@/lib/storage";
import type { BudgetItem, BudgetState, CategoryId, GroupSplit, SubSplit } from "@/lib/types";

type Action =
  | { type: "SET_CURRENCY"; currency: string }
  | { type: "SET_INCOME"; income: number }
  | { type: "SET_RULE"; ruleId: string }
  | { type: "SET_CUSTOM_SPLIT"; split: GroupSplit }
  | { type: "SET_SUB_SPLIT"; sub: SubSplit }
  | { type: "ADD_ITEM"; category: CategoryId; item: BudgetItem }
  | { type: "UPDATE_ITEM"; category: CategoryId; item: BudgetItem }
  | { type: "DELETE_ITEM"; category: CategoryId; itemId: string }
  | { type: "REORDER_ITEMS"; category: CategoryId; fromIndex: number; toIndex: number }
  | { type: "RESET" };

function reducer(state: BudgetState, action: Action): BudgetState {
  switch (action.type) {
    case "SET_CURRENCY":
      return { ...state, currency: action.currency };
    case "SET_INCOME":
      return { ...state, income: Math.max(action.income, 0) };
    case "SET_RULE": {
      if (action.ruleId === CUSTOM_RULE_ID) {
        const currentSplit = getGroupSplit(state.ruleId, state.customSplit);
        return { ...state, ruleId: CUSTOM_RULE_ID, customSplit: currentSplit };
      }
      return { ...state, ruleId: action.ruleId };
    }
    case "SET_CUSTOM_SPLIT":
      return { ...state, ruleId: CUSTOM_RULE_ID, customSplit: action.split };
    case "SET_SUB_SPLIT":
      return { ...state, subSplit: action.sub };
    case "ADD_ITEM":
      return {
        ...state,
        items: {
          ...state.items,
          [action.category]: [...state.items[action.category], action.item],
        },
      };
    case "UPDATE_ITEM":
      return {
        ...state,
        items: {
          ...state.items,
          [action.category]: state.items[action.category].map((it) =>
            it.id === action.item.id ? action.item : it
          ),
        },
      };
    case "DELETE_ITEM":
      return {
        ...state,
        items: {
          ...state.items,
          [action.category]: state.items[action.category].filter(
            (it) => it.id !== action.itemId
          ),
        },
      };
    case "REORDER_ITEMS": {
      const list = [...state.items[action.category]];
      const [moved] = list.splice(action.fromIndex, 1);
      list.splice(action.toIndex, 0, moved);
      return { ...state, items: { ...state.items, [action.category]: list } };
    }
    case "RESET":
      return defaultBudgetState();
    default:
      return state;
  }
}

interface BudgetContextValue {
  state: BudgetState;
  result: ReturnType<typeof calculateBudget>;
  setCurrency: (currency: string) => void;
  setIncome: (income: number) => void;
  setRule: (ruleId: string) => void;
  setCustomSplit: (split: GroupSplit) => void;
  setSubSplit: (sub: SubSplit) => void;
  addItem: (category: CategoryId, item: BudgetItem) => void;
  updateItem: (category: CategoryId, item: BudgetItem) => void;
  deleteItem: (category: CategoryId, itemId: string) => void;
  reorderItems: (category: CategoryId, fromIndex: number, toIndex: number) => void;
  resetAll: () => void;
}

const BudgetContext = createContext<BudgetContextValue | null>(null);

export function BudgetProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadBudgetState);

  useEffect(() => {
    saveBudgetState(state);
  }, [state]);

  const result = useMemo(() => calculateBudget(state), [state]);

  const setCurrency = useCallback((currency: string) => dispatch({ type: "SET_CURRENCY", currency }), []);
  const setIncome = useCallback((income: number) => dispatch({ type: "SET_INCOME", income }), []);
  const setRule = useCallback((ruleId: string) => dispatch({ type: "SET_RULE", ruleId }), []);
  const setCustomSplit = useCallback((split: GroupSplit) => dispatch({ type: "SET_CUSTOM_SPLIT", split }), []);
  const setSubSplit = useCallback((sub: SubSplit) => dispatch({ type: "SET_SUB_SPLIT", sub }), []);
  const addItem = useCallback(
    (category: CategoryId, item: BudgetItem) => dispatch({ type: "ADD_ITEM", category, item }),
    []
  );
  const updateItem = useCallback(
    (category: CategoryId, item: BudgetItem) => dispatch({ type: "UPDATE_ITEM", category, item }),
    []
  );
  const deleteItem = useCallback(
    (category: CategoryId, itemId: string) => dispatch({ type: "DELETE_ITEM", category, itemId }),
    []
  );
  const reorderItems = useCallback(
    (category: CategoryId, fromIndex: number, toIndex: number) =>
      dispatch({ type: "REORDER_ITEMS", category, fromIndex, toIndex }),
    []
  );
  const resetAll = useCallback(() => dispatch({ type: "RESET" }), []);

  const value = useMemo(
    () => ({
      state,
      result,
      setCurrency,
      setIncome,
      setRule,
      setCustomSplit,
      setSubSplit,
      addItem,
      updateItem,
      deleteItem,
      reorderItems,
      resetAll,
    }),
    [state, result, setCurrency, setIncome, setRule, setCustomSplit, setSubSplit, addItem, updateItem, deleteItem, reorderItems, resetAll]
  );

  return <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>;
}

export function useBudget(): BudgetContextValue {
  const ctx = useContext(BudgetContext);
  if (!ctx) throw new Error("useBudget must be used within a BudgetProvider");
  return ctx;
}
