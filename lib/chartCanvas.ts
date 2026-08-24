import { CATEGORY_COLORS } from "./colors";
import { formatCurrency } from "./currencies";
import type { CalculationResult } from "./types";

export const CHART_WIDTH = 380;
export const CHART_HEIGHT = 420;

interface DrawOptions {
  scale?: number;
  theme?: "light" | "dark";
}

function themeColors(theme: "light" | "dark") {
  return theme === "dark"
    ? { bg: "#181c21", fg: "#f2f4f6", muted: "#9aa4ad", track: "#20252b", danger: "#ef6a5e" }
    : { bg: "#ffffff", fg: "#171b1f", muted: "#6b7580", track: "#eef1f3", danger: "#d64a3e" };
}

export function drawBudgetChart(
  canvas: HTMLCanvasElement,
  result: CalculationResult,
  { scale = 1, theme = "light" }: DrawOptions = {}
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const colors = themeColors(theme);

  canvas.width = CHART_WIDTH * scale;
  canvas.height = CHART_HEIGHT * scale;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.clearRect(0, 0, CHART_WIDTH, CHART_HEIGHT);

  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, CHART_WIDTH, CHART_HEIGHT);

  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = colors.fg;
  ctx.font = "600 16px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Budget Split", CHART_WIDTH / 2, 28);

  ctx.font = "12px system-ui, -apple-system, sans-serif";
  ctx.fillStyle = colors.muted;
  ctx.fillText(formatCurrency(result.income, result.currency) + " / month", CHART_WIDTH / 2, 46);

  const cx = CHART_WIDTH / 2;
  const cy = 150;
  const rOuter = 82;
  const rInner = 50;

  const total = result.categories.reduce((s, c) => s + Math.max(c.allocated, 0), 0);

  if (total <= 0) {
    ctx.beginPath();
    ctx.arc(cx, cy, rOuter, 0, Math.PI * 2);
    ctx.fillStyle = colors.track;
    ctx.fill();
    ctx.font = "13px system-ui, -apple-system, sans-serif";
    ctx.fillStyle = colors.muted;
    ctx.textAlign = "center";
    ctx.fillText("Enter income to", cx, cy - 4);
    ctx.fillText("see your split", cx, cy + 14);
  } else {
    let angle = -Math.PI / 2;
    for (const cat of result.categories) {
      const share = Math.max(cat.allocated, 0) / total;
      if (share <= 0) continue;
      const next = angle + share * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, rOuter, angle, next);
      ctx.closePath();
      ctx.fillStyle = CATEGORY_COLORS[cat.id];
      ctx.fill();
      angle = next;
    }
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(cx, cy, rInner, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";
  }

  let y = 258;
  const rowHeight = 32;
  ctx.textAlign = "left";
  for (const cat of result.categories) {
    ctx.fillStyle = CATEGORY_COLORS[cat.id];
    ctx.beginPath();
    ctx.arc(28, y - 4, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = colors.fg;
    ctx.font = "600 13px system-ui, -apple-system, sans-serif";
    ctx.fillText(cat.label, 44, y);

    const pct = total > 0 ? (cat.allocated / total) * 100 : 0;
    ctx.font = "12px system-ui, -apple-system, sans-serif";
    ctx.fillStyle = colors.muted;
    ctx.fillText(`${pct.toFixed(1)}%`, 44, y + 15);

    ctx.textAlign = "right";
    ctx.font = "600 13px system-ui, -apple-system, sans-serif";
    ctx.fillStyle = colors.fg;
    ctx.fillText(formatCurrency(cat.allocated, result.currency), CHART_WIDTH - 20, y);
    ctx.textAlign = "left";

    y += rowHeight;
  }

  if (result.deficit) {
    ctx.textAlign = "center";
    ctx.font = "600 12px system-ui, -apple-system, sans-serif";
    ctx.fillStyle = colors.danger;
    ctx.fillText(
      `Over budget by ${formatCurrency(result.shortfall, result.currency)}`,
      CHART_WIDTH / 2,
      CHART_HEIGHT - 14
    );
  }
}

export function exportCanvasAsPng(canvas: HTMLCanvasElement, filename: string) {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, "image/png");
}
