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
import { calculateLoan } from "@/lib/loan/calculate";
import { defaultLoanState, loadLoanState, saveLoanState } from "@/lib/loan/storage";
import type { LoanState, LumpSumPlan } from "@/lib/loan/types";

type Action =
  | { type: "SET_FIELD"; field: keyof LoanState; value: LoanState[keyof LoanState] }
  | { type: "SET_LUMP_SUM"; value: LumpSumPlan }
  | { type: "RESET" };

function reducer(state: LoanState, action: Action): LoanState {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "SET_LUMP_SUM":
      return { ...state, lumpSum: action.value };
    case "RESET":
      return defaultLoanState();
    default:
      return state;
  }
}

interface LoanContextValue {
  state: LoanState;
  result: ReturnType<typeof calculateLoan>;
  setField: <K extends keyof LoanState>(field: K, value: LoanState[K]) => void;
  setLumpSum: (value: LumpSumPlan) => void;
  resetAll: () => void;
}

const LoanContext = createContext<LoanContextValue | null>(null);

export function LoanProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadLoanState);

  useEffect(() => {
    saveLoanState(state);
  }, [state]);

  const result = useMemo(() => calculateLoan(state), [state]);

  const setField = useCallback(
    <K extends keyof LoanState>(field: K, value: LoanState[K]) =>
      dispatch({ type: "SET_FIELD", field, value }),
    []
  );
  const setLumpSum = useCallback((value: LumpSumPlan) => dispatch({ type: "SET_LUMP_SUM", value }), []);
  const resetAll = useCallback(() => dispatch({ type: "RESET" }), []);

  const value = useMemo(
    () => ({ state, result, setField, setLumpSum, resetAll }),
    [state, result, setField, setLumpSum, resetAll]
  );

  return <LoanContext.Provider value={value}>{children}</LoanContext.Provider>;
}

export function useLoan(): LoanContextValue {
  const ctx = useContext(LoanContext);
  if (!ctx) throw new Error("useLoan must be used within a LoanProvider");
  return ctx;
}
