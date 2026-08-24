"use client";

import { Menu } from "lucide-react";
import packageJson from "@/package.json";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MODULES, type ModuleId } from "@/lib/constants";

export function NavSheet({
  activeModule,
  onSelect,
}: {
  activeModule: ModuleId;
  onSelect: (module: ModuleId) => void;
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button type="button" variant="outline" size="icon" aria-label="Open menu" className="h-10 w-10 rounded-full">
          <Menu size={17} />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex w-3/4 flex-col p-0 sm:max-w-xs">
        <SheetHeader className="border-b border-border">
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>

        <nav className="flex flex-1 flex-col gap-1.5 p-3">
          {MODULES.map((module) => {
            const Icon = module.icon;
            const isActive = module.id === activeModule;
            return (
              <SheetClose asChild key={module.id}>
                <button
                  type="button"
                  onClick={() => onSelect(module.id)}
                  className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-all active:scale-[0.98] ${
                    isActive
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-transparent bg-card hover:border-border"
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                      isActive ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    <Icon size={17} strokeWidth={2} />
                  </span>
                  <span className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">{module.label}</p>
                    <p className="truncate text-xs text-muted-foreground">{module.description}</p>
                  </span>
                </button>
              </SheetClose>
            );
          })}
        </nav>

        <SheetFooter className="border-t border-border">
          <p className="text-sm font-semibold text-foreground">BudgetSmart</p>
          <p className="text-xs text-muted-foreground">Version {packageJson.version}</p>
          <p className="text-xs text-muted-foreground">Developed by Gulger Mallik</p>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
