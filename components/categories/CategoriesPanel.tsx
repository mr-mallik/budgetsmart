"use client";

import { LayoutGrid } from "lucide-react";
import { CATEGORY_ORDER } from "@/lib/categories";
import { CategoryCard } from "./CategoryCard";

export function CategoriesPanel() {
  return (
    <div className="flex flex-col gap-3 pb-6">
      <div className="flex items-start gap-2.5 px-1">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
          <LayoutGrid size={15} strokeWidth={2.2} />
        </span>
        <div>
          <h2 className="text-lg font-semibold leading-tight text-foreground">Fixed costs</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Add items if you want to track real costs and priorities. Leave a category
            empty to just see your spending power for it.
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {CATEGORY_ORDER.map((id) => (
          <CategoryCard key={id} categoryId={id} />
        ))}
      </div>
    </div>
  );
}
