import { CATEGORY_META } from "./categories";
import { formatCurrency } from "./currencies";
import type { CalculationResult, CategoryResult } from "./types";

const WIDTH = 56;

function rule(char = "="): string {
  return char.repeat(WIDTH);
}

function padRow(label: string, value: string): string {
  const gap = Math.max(WIDTH - label.length - value.length, 1);
  return `${label}${" ".repeat(gap)}${value}`;
}

function money(amount: number, currency: string): string {
  return formatCurrency(amount, currency);
}

function renderCategory(cat: CategoryResult, currency: string): string[] {
  const lines: string[] = [];
  const pctLabel = `${cat.targetPct.toFixed(1)}% target`;
  lines.push(padRow(`${cat.label} (${pctLabel})`, money(cat.allocated, currency)));

  if (cat.mode === "spendingPower") {
    lines.push("    spending power, no items entered");
  } else if (cat.items) {
    cat.items.forEach((item, i) => {
      const marker = item.cut ? "x" : String(i + 1);
      const status = item.cut ? "CUT (over budget)" : money(item.funded, currency);
      lines.push(`    [${marker}] ${item.name.padEnd(24)} ${status}`);
    });
    if (cat.unallocated && cat.unallocated > 0.005) {
      lines.push(`    + ${money(cat.unallocated, currency)} unallocated (extra spending power)`);
    }
  }
  return lines;
}

export function generateAsciiReport(result: CalculationResult): string {
  const { currency } = result;
  const lines: string[] = [];

  lines.push(rule());
  lines.push(centered("BUDGET ALLOCATION REPORT"));
  lines.push(rule());
  lines.push(padRow("Monthly Income:", money(result.income, currency)));
  lines.push("");

  const mandatory = result.categories.filter((c) => CATEGORY_META[c.id].mandatory);
  const flexible = result.categories.filter((c) => !CATEGORY_META[c.id].mandatory);

  lines.push("MANDATORY (always paid in full):");
  mandatory.forEach((cat) => lines.push(...renderCategory(cat, currency)));
  lines.push(padRow("  Total Mandatory:", money(result.mandatoryTotal, currency)));
  lines.push("");

  lines.push("FLEXIBLE (funded by priority from what remains):");
  flexible.forEach((cat) => lines.push(...renderCategory(cat, currency)));
  const flexTotal = flexible.reduce((s, c) => s + c.allocated, 0);
  lines.push(padRow("  Total Flexible:", money(flexTotal, currency)));
  lines.push("");

  lines.push(rule("-"));
  if (result.deficit) {
    lines.push(centered("⚠ OVER BUDGET"));
    lines.push(padRow("  Shortfall:", money(result.shortfall, currency)));
    lines.push("  Mandatory costs exceed income. Flexible categories are at 0.");
  } else {
    lines.push(padRow("TOTAL ALLOCATED:", money(result.totalAllocated, currency)));
  }
  lines.push(rule());

  return lines.join("\n");
}

function centered(text: string): string {
  const pad = Math.max(Math.floor((WIDTH - text.length) / 2), 0);
  return " ".repeat(pad) + text;
}
