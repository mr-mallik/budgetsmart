"use client";

import { useEffect, useRef } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTheme } from "@/context/ThemeContext";
import { CHART_HEIGHT, CHART_WIDTH, drawBudgetChart, exportCanvasAsPng } from "@/lib/chartCanvas";
import type { CalculationResult } from "@/lib/types";

export function PieChart({ result }: { result: CalculationResult }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    drawBudgetChart(canvas, result, { scale: dpr, theme });
  }, [result, theme]);

  function handleDownload() {
    const exportCanvas = document.createElement("canvas");
    drawBudgetChart(exportCanvas, result, { scale: 3, theme });
    exportCanvasAsPng(exportCanvas, "budget_chart.png");
  }

  return (
    <Card className="p-3">
      <canvas
        ref={canvasRef}
        style={{ width: CHART_WIDTH, height: CHART_HEIGHT }}
        className="mx-auto block max-w-full"
      />
      <Button type="button" size="lg" onClick={handleDownload} className="mt-2 w-full">
        <Download size={15} />
        Download chart (PNG)
      </Button>
    </Card>
  );
}
