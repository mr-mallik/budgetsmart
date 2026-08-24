"use client";

import { LayoutGrid, ChartPie, SlidersHorizontal } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { APP_MAX_WIDTH } from "@/lib/constants";
import type { TabId } from "@/lib/types";

const TABS: { id: TabId; label: string; icon: LucideIcon }[] = [
  { id: "setup", label: "Setup", icon: SlidersHorizontal },
  { id: "categories", label: "Categories", icon: LayoutGrid },
  { id: "results", label: "Results", icon: ChartPie },
];

export function BottomNav({
  active,
  onChange,
}: {
  active: TabId;
  onChange: (tab: TabId) => void;
}) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-card/95 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur">
      <div className={`mx-auto flex w-full ${APP_MAX_WIDTH} items-stretch justify-around px-[env(safe-area-inset-left)]`}>
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className="flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium text-muted-foreground transition-transform active:scale-95"
            >
              <span
                className={`flex h-7 w-11 items-center justify-center rounded-full transition-all duration-200 ${
                  isActive ? "scale-105 bg-primary/15 text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon size={18} strokeWidth={isActive ? 2.3 : 1.8} />
              </span>
              <span className={`transition-colors duration-200 ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
