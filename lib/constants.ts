import { LandmarkIcon, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/** Content column width: full width on mobile, capped at a tablet width on larger screens. */
export const APP_MAX_WIDTH = "max-w-md md:max-w-3xl";

export type ModuleId = "budget" | "loan";

export interface ModuleMeta {
  id: ModuleId;
  label: string;
  description: string;
  icon: LucideIcon;
}

export const MODULES: ModuleMeta[] = [
  {
    id: "budget",
    label: "Budget",
    description: "Split your income into a plan",
    icon: Wallet,
  },
  {
    id: "loan",
    label: "Loan Repayment",
    description: "Plan payoff and prepayments",
    icon: LandmarkIcon,
  },
];
