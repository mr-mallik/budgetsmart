import { formatCurrency } from "../currencies";
import type { ScheduleSummary } from "./types";

export const LINE_CHART_WIDTH = 380;
export const LINE_CHART_HEIGHT = 300;
export const PIE_CHART_WIDTH = 380;
export const PIE_CHART_HEIGHT = 300;

interface DrawOptions {
  scale?: number;
  theme?: "light" | "dark";
}

const INTEREST_COLOR = "#e0665a";
const PRINCIPAL_COLOR = "#1f9d73";
const ORIGINAL_COLOR = "#9aa4ad";
const REVISED_COLOR = "#1f9d73";

function themeColors(theme: "light" | "dark") {
  return theme === "dark"
    ? { bg: "#181c21", fg: "#f2f4f6", muted: "#9aa4ad", grid: "#262b31" }
    : { bg: "#ffffff", fg: "#171b1f", muted: "#6b7580", grid: "#eef1f3" };
}

function setupCanvas(canvas: HTMLCanvasElement, width: number, height: number, scale: number) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  canvas.width = width * scale;
  canvas.height = height * scale;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  return ctx;
}

export function drawBalanceLineChart(
  canvas: HTMLCanvasElement,
  original: ScheduleSummary | null,
  revised: ScheduleSummary | null,
  currency: string,
  { scale = 1, theme = "light" }: DrawOptions = {}
) {
  const colors = themeColors(theme);
  const ctx = setupCanvas(canvas, LINE_CHART_WIDTH, LINE_CHART_HEIGHT, scale);
  if (!ctx) return;

  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, LINE_CHART_WIDTH, LINE_CHART_HEIGHT);

  ctx.textAlign = "center";
  ctx.fillStyle = colors.fg;
  ctx.font = "600 16px system-ui, -apple-system, sans-serif";
  ctx.fillText("Balance Over Time", LINE_CHART_WIDTH / 2, 26);

  const padLeft = 52;
  const padRight = 16;
  const padTop = 44;
  const padBottom = 46;
  const plotW = LINE_CHART_WIDTH - padLeft - padRight;
  const plotH = LINE_CHART_HEIGHT - padTop - padBottom;

  const maxBalance = Math.max(original?.rows[0]?.opening ?? 0, revised?.rows[0]?.opening ?? 0, 1);
  const maxMonths = Math.max(original?.months ?? 0, revised?.months ?? 0, 1);
  const maxYears = maxMonths / 12;

  const x = (months: number) => padLeft + (months / maxMonths) * plotW;
  const y = (balance: number) => padTop + plotH - (balance / maxBalance) * plotH;

  // Gridlines + y-axis labels (balance)
  ctx.strokeStyle = colors.grid;
  ctx.fillStyle = colors.muted;
  ctx.font = "10px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "right";
  const ySteps = 4;
  for (let i = 0; i <= ySteps; i++) {
    const value = (maxBalance / ySteps) * i;
    const yPos = y(value);
    ctx.beginPath();
    ctx.moveTo(padLeft, yPos);
    ctx.lineTo(padLeft + plotW, yPos);
    ctx.stroke();
    ctx.fillText(formatCurrency(value, currency).replace(/\.00$/, ""), padLeft - 6, yPos + 3);
  }

  // X-axis labels (years)
  ctx.textAlign = "center";
  const xSteps = Math.min(Math.max(Math.round(maxYears), 1), 6);
  for (let i = 0; i <= xSteps; i++) {
    const yearVal = (maxYears / xSteps) * i;
    const xPos = x(yearVal * 12);
    ctx.fillText(`${yearVal.toFixed(yearVal % 1 === 0 ? 0 : 1)}y`, xPos, padTop + plotH + 16);
  }

  function drawLine(schedule: ScheduleSummary | null, color: string) {
    if (!schedule) return;
    ctx!.strokeStyle = color;
    ctx!.lineWidth = 2.2;
    ctx!.beginPath();
    ctx!.moveTo(x(0), y(schedule.rows[0]?.opening ?? 0));
    schedule.rows.forEach((row) => {
      ctx!.lineTo(x(row.index), y(row.closing));
    });
    ctx!.stroke();
  }

  drawLine(original, ORIGINAL_COLOR);
  drawLine(revised, REVISED_COLOR);

  // Legend
  const legendY = LINE_CHART_HEIGHT - 14;
  ctx.textAlign = "left";
  ctx.font = "600 11px system-ui, -apple-system, sans-serif";

  ctx.fillStyle = ORIGINAL_COLOR;
  ctx.fillRect(padLeft, legendY - 8, 10, 10);
  ctx.fillStyle = colors.fg;
  ctx.fillText("Original", padLeft + 14, legendY);

  ctx.fillStyle = REVISED_COLOR;
  ctx.fillRect(padLeft + 90, legendY - 8, 10, 10);
  ctx.fillStyle = colors.fg;
  ctx.fillText("Revised", padLeft + 104, legendY);
}

function drawDonut(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rOuter: number,
  rInner: number,
  interest: number,
  principal: number
) {
  const total = interest + principal;
  if (total <= 0) return;
  let angle = -Math.PI / 2;
  const slices: [number, string][] = [
    [interest, INTEREST_COLOR],
    [principal, PRINCIPAL_COLOR],
  ];
  for (const [value, color] of slices) {
    const share = value / total;
    if (share <= 0) continue;
    const next = angle + share * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, rOuter, angle, next);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    angle = next;
  }
  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.arc(cx, cy, rInner, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = "source-over";
}

export function drawComparisonPies(
  canvas: HTMLCanvasElement,
  original: ScheduleSummary | null,
  revised: ScheduleSummary | null,
  principal: number,
  currency: string,
  { scale = 1, theme = "light" }: DrawOptions = {}
) {
  const colors = themeColors(theme);
  const ctx = setupCanvas(canvas, PIE_CHART_WIDTH, PIE_CHART_HEIGHT, scale);
  if (!ctx) return;

  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, PIE_CHART_WIDTH, PIE_CHART_HEIGHT);

  ctx.textAlign = "center";
  ctx.fillStyle = colors.fg;
  ctx.font = "600 16px system-ui, -apple-system, sans-serif";
  ctx.fillText("Interest vs Principal", PIE_CHART_WIDTH / 2, 26);

  const cy = 118;
  const rOuter = 58;
  const rInner = 34;
  const cxLeft = PIE_CHART_WIDTH * 0.28;
  const cxRight = PIE_CHART_WIDTH * 0.72;

  drawDonut(ctx, cxLeft, cy, rOuter, rInner, original?.totalInterest ?? 0, principal);
  drawDonut(ctx, cxRight, cy, rOuter, rInner, revised?.totalInterest ?? 0, principal);

  ctx.font = "600 13px system-ui, -apple-system, sans-serif";
  ctx.fillStyle = colors.fg;
  ctx.fillText("Original", cxLeft, cy + rOuter + 22);
  ctx.fillText("Revised", cxRight, cy + rOuter + 22);

  ctx.font = "11px system-ui, -apple-system, sans-serif";
  ctx.fillStyle = colors.muted;
  ctx.fillText(`Interest ${formatCurrency(original?.totalInterest ?? 0, currency)}`, cxLeft, cy + rOuter + 38);
  ctx.fillText(`Interest ${formatCurrency(revised?.totalInterest ?? 0, currency)}`, cxRight, cy + rOuter + 38);

  // Shared legend
  const legendY = PIE_CHART_HEIGHT - 14;
  ctx.textAlign = "left";
  ctx.font = "600 11px system-ui, -apple-system, sans-serif";
  ctx.fillStyle = INTEREST_COLOR;
  ctx.fillRect(PIE_CHART_WIDTH / 2 - 90, legendY - 8, 10, 10);
  ctx.fillStyle = colors.fg;
  ctx.fillText("Interest", PIE_CHART_WIDTH / 2 - 76, legendY);

  ctx.fillStyle = PRINCIPAL_COLOR;
  ctx.fillRect(PIE_CHART_WIDTH / 2 + 10, legendY - 8, 10, 10);
  ctx.fillStyle = colors.fg;
  ctx.fillText("Principal", PIE_CHART_WIDTH / 2 + 24, legendY);
}
