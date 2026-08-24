"use client";

import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/currencies";
import { downloadCsv } from "@/lib/loan/csv";
import type { ScheduleSummary } from "@/lib/loan/types";

export function ScheduleTable({ schedule, currency }: { schedule: ScheduleSummary; currency: string }) {
  return (
    <Card className="p-3">
      <div className="mb-2 flex items-center justify-between px-0.5">
        <p className="text-xs font-medium text-muted-foreground">Revised repayment schedule</p>
        <p className="text-xs text-muted-foreground">{schedule.months} months</p>
      </div>
      <div className="max-h-80 overflow-y-auto rounded-xl border border-border">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-card">
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">EMI</TableHead>
              <TableHead className="text-right">Interest</TableHead>
              <TableHead className="text-right">Principal</TableHead>
              <TableHead className="text-right">Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schedule.rows.map((row) => (
              <TableRow key={row.index}>
                <TableCell className="text-muted-foreground">{row.index}</TableCell>
                <TableCell>{row.date}</TableCell>
                <TableCell className="text-right tabular-nums">{formatCurrency(row.emi, currency)}</TableCell>
                <TableCell className="text-right tabular-nums text-muted-foreground">
                  {formatCurrency(row.interest, currency)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCurrency(row.principal, currency)}
                  {row.lumpSumApplied ? (
                    <span className="ml-1 text-[10px] text-primary">+lump sum</span>
                  ) : null}
                </TableCell>
                <TableCell className="text-right tabular-nums">{formatCurrency(row.closing, currency)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Button
        type="button"
        size="lg"
        onClick={() => downloadCsv(schedule.rows, "loan_repayment_schedule.csv")}
        className="mt-2 w-full"
      >
        <FileDown size={15} />
        Download CSV
      </Button>
    </Card>
  );
}
