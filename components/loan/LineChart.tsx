"use client";

import { useEffect, useRef } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTheme } from "@/context/ThemeContext";
import { exportCanvasAsPng } from "@/lib/chartCanvas";
import { LINE_CHART_HEIGHT, LINE_CHART_WIDTH, drawBalanceLineChart } from "@/lib/loan/chartCanvas";
import type { ScheduleSummary } from "@/lib/loan/types";

export function LineChart({
  original,
  revised,
  currency,
}: {
  original: ScheduleSummary | null;
  revised: ScheduleSummary | null;
  currency: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    drawBalanceLineChart(canvas, original, revised, currency, { scale: dpr, theme });
  }, [original, revised, currency, theme]);

  function handleDownload() {
    const exportCanvas = document.createElement("canvas");
    drawBalanceLineChart(exportCanvas, original, revised, currency, { scale: 3, theme });
    exportCanvasAsPng(exportCanvas, "loan_balance_chart.png");
  }

  return (
    <Card className="p-3">
      <canvas
        ref={canvasRef}
        style={{ width: LINE_CHART_WIDTH, height: LINE_CHART_HEIGHT }}
        className="mx-auto block max-w-full"
      />
      <Button type="button" size="lg" onClick={handleDownload} className="mt-2 w-full">
        <Download size={15} />
        Download chart (PNG)
      </Button>
    </Card>
  );
}
