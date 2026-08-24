"use client";

import { useRef, useState } from "react";
import type { ReactNode } from "react";

interface ReorderableItemListProps<T> {
  items: T[];
  getId: (item: T) => string;
  onReorder: (fromIndex: number, toIndex: number) => void;
  renderItem: (item: T, index: number, dragHandleProps: DragHandleProps) => ReactNode;
}

export interface DragHandleProps {
  onPointerDown: (e: React.PointerEvent) => void;
  "aria-label": string;
}

/**
 * Touch/mouse drag-to-reorder list using pointer events (no DnD library).
 * Rows swap live as the dragged row's center crosses a neighbor's center.
 */
export function ReorderableItemList<T>({
  items,
  getId,
  onReorder,
  renderItem,
}: ReorderableItemListProps<T>) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragY, setDragY] = useState(0);
  const startY = useRef(0);
  const rowHeight = useRef(0);
  const currentIndex = useRef<number | null>(null);

  function handlePointerDown(index: number, e: React.PointerEvent) {
    const row = (e.currentTarget as HTMLElement).closest<HTMLElement>("[data-drag-row]");
    if (!row) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    rowHeight.current = row.getBoundingClientRect().height;
    startY.current = e.clientY;
    currentIndex.current = index;
    setDragIndex(index);
    setDragY(0);

    function onMove(ev: PointerEvent) {
      const delta = ev.clientY - startY.current;
      setDragY(delta);
      const from = currentIndex.current;
      if (from === null) return;
      const steps = Math.round(delta / rowHeight.current);
      const to = Math.min(Math.max(from + steps, 0), items.length - 1);
      if (to !== from) {
        onReorder(from, to);
        currentIndex.current = to;
        startY.current = ev.clientY;
        setDragY(0);
        setDragIndex(to);
      }
    }

    function onUp() {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      currentIndex.current = null;
      setDragIndex(null);
      setDragY(0);
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  return (
    <div className="flex flex-col gap-2">
      {/* eslint-disable-next-line react-hooks/refs -- refs here are only ever
          read/written inside pointer event handlers (drag gesture tracking),
          never during render; this is the standard non-visual-ref pattern. */}
      {items.map((item, index) => {
        const id = getId(item);
        const isDragging = dragIndex === index;
        return (
          <div
            key={id}
            data-drag-row
            style={
              isDragging
                ? { transform: `translateY(${dragY}px)`, zIndex: 10, position: "relative" }
                : undefined
            }
            className={isDragging ? "shadow-lg" : undefined}
          >
            {renderItem(item, index, {
              onPointerDown: (e) => handlePointerDown(index, e),
              "aria-label": "Drag to reorder",
            })}
          </div>
        );
      })}
    </div>
  );
}
