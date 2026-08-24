import { Landmark, House, Ticket, PiggyBank, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { CategoryId } from "@/lib/types";

export const CATEGORY_ICONS: Record<CategoryId, LucideIcon> = {
  debt: Landmark,
  essential: House,
  leisure: Ticket,
  shortTerm: PiggyBank,
  longTerm: TrendingUp,
};
