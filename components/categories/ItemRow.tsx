"use client";

import { CircleAlert, GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/currencies";
import type { BudgetItem, ItemResult } from "@/lib/types";
import type { DragHandleProps } from "./ReorderableItemList";

interface ItemRowProps {
  item: BudgetItem;
  currency: string;
  priorityIndex?: number;
  resultInfo?: ItemResult;
  dragHandleProps?: DragHandleProps;
  onDelete: () => void;
}

export function ItemRow({
  item,
  currency,
  priorityIndex,
  resultInfo,
  dragHandleProps,
  onDelete,
}: ItemRowProps) {
  return (
    <div
      className={`animate-in fade-in-0 slide-in-from-left-1 flex items-center gap-2 rounded-xl border px-3 py-2.5 duration-200 ease-out transition-colors ${
        resultInfo?.cut ? "border-destructive/40 bg-destructive/5" : "border-border bg-card"
      }`}
    >
      {dragHandleProps && (
        <button
          type="button"
          className="shrink-0 touch-none cursor-grab select-none rounded-md p-1.5 text-muted-foreground active:cursor-grabbing"
          onPointerDown={dragHandleProps.onPointerDown}
          aria-label={dragHandleProps["aria-label"]}
        >
          <GripVertical size={16} />
        </button>
      )}
      {priorityIndex !== undefined && (
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
          {priorityIndex + 1}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
        {resultInfo?.cut && (
          <p className="flex items-center gap-1 text-xs font-medium text-destructive">
            <CircleAlert size={11} />
            Cut, over budget
          </p>
        )}
      </div>
      <span className="shrink-0 text-sm tabular-nums text-foreground">
        {formatCurrency(item.amount, currency)}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={onDelete}
        aria-label={`Delete ${item.name}`}
        className="shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
      >
        <Trash2 size={15} />
      </Button>
    </div>
  );
}
