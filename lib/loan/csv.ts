import type { ScheduleRow } from "./types";

function csvCell(value: string | number): string {
  const str = String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

export function scheduleToCsv(rows: ScheduleRow[]): string {
  const header = [
    "Month",
    "Date",
    "Opening balance",
    "EMI",
    "Interest",
    "Principal",
    "Lump sum",
    "Closing balance",
  ];
  const lines = [header.map(csvCell).join(",")];
  for (const row of rows) {
    lines.push(
      [
        row.index,
        row.date,
        row.opening.toFixed(2),
        row.emi.toFixed(2),
        row.interest.toFixed(2),
        row.principal.toFixed(2),
        row.lumpSumApplied ? row.lumpSumApplied.toFixed(2) : "",
        row.closing.toFixed(2),
      ]
        .map(csvCell)
        .join(",")
    );
  }
  return lines.join("\n");
}

export function downloadCsv(rows: ScheduleRow[], filename: string): void {
  const csv = scheduleToCsv(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
