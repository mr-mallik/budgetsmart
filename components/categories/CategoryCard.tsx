"use client";

import { useId, useState } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { useBudget } from "@/context/BudgetContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CATEGORY_META } from "@/lib/categories";
import { CATEGORY_COLORS } from "@/lib/colors";
import { categoryById } from "@/lib/calculate";
import { formatCurrency } from "@/lib/currencies";
import type { CategoryId } from "@/lib/types";
import { CATEGORY_ICONS } from "../categoryIcons";
import { ItemRow } from "./ItemRow";
import { ReorderableItemList } from "./ReorderableItemList";

export function CategoryCard({ categoryId }: { categoryId: CategoryId }) {
  const { state, result, addItem, deleteItem, reorderItems } = useBudget();
  const meta = CATEGORY_META[categoryId];
  const Icon = CATEGORY_ICONS[categoryId];
  const color = CATEGORY_COLORS[categoryId];
  const items = state.items[categoryId];
  const catResult = categoryById(result, categoryId);
  const [open, setOpen] = useState(items.length > 0);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const formId = useId();

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!name.trim() || !Number.isFinite(parsedAmount) || parsedAmount <= 0) return;
    addItem(categoryId, {
      id: crypto.randomUUID(),
      name: name.trim(),
      amount: parsedAmount,
    });
    setName("");
    setAmount("");
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
      >
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: `${color}1f`, color }}
        >
          <Icon size={17} strokeWidth={2} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">{meta.label}</h3>
            {meta.mandatory ? (
              <Badge className="bg-primary/12 text-primary">mandatory</Badge>
            ) : (
              <Badge variant="secondary">flexible</Badge>
            )}
          </div>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{meta.description}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-sm font-semibold tabular-nums text-foreground">
            {formatCurrency(catResult.allocated, state.currency)}
          </span>
          <ChevronDown
            size={15}
            className={`shrink-0 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {open && (
        <div className="border-t border-border px-4 py-3.5">
          {items.length === 0 && (
            <p className="mb-3 text-xs text-muted-foreground">
              No items yet. This category will show as spending power in your results.
            </p>
          )}

          {items.length > 0 && !meta.mandatory && (
            <ReorderableItemList
              items={items}
              getId={(item) => item.id}
              onReorder={(from, to) => reorderItems(categoryId, from, to)}
              renderItem={(item, index, dragHandleProps) => (
                <ItemRow
                  item={item}
                  currency={state.currency}
                  priorityIndex={index}
                  resultInfo={catResult.items?.find((r) => r.id === item.id)}
                  dragHandleProps={dragHandleProps}
                  onDelete={() => deleteItem(categoryId, item.id)}
                />
              )}
            />
          )}

          {items.length > 0 && meta.mandatory && (
            <div className="flex flex-col gap-2">
              {items.map((item) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  currency={state.currency}
                  resultInfo={catResult.items?.find((r) => r.id === item.id)}
                  onDelete={() => deleteItem(categoryId, item.id)}
                />
              ))}
            </div>
          )}

          <form onSubmit={handleAdd} className="mt-3 flex items-center gap-2">
            <Input
              id={`${formId}-name`}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Item name"
              className="h-10 min-w-0 flex-1"
            />
            <Input
              id={`${formId}-amount`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount"
              className="h-10 w-24 shrink-0"
            />
            <Button type="submit" size="lg" className="shrink-0">
              <Plus size={15} strokeWidth={2.5} />
              Add
            </Button>
          </form>
          {!meta.mandatory && items.length > 1 && (
            <p className="mt-2 text-xs text-muted-foreground">
              Drag ⠿ to set priority. Top item gets funded first.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
