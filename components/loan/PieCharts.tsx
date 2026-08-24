"use client";

import { useEffect, useRef } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTheme } from "@/context/ThemeContext";
import { exportCanvasAsPng } from "@/lib/chartCanvas";
import { PIE_CHART_HEIGHT, PIE_CHART_WIDTH, drawComparisonPies } from "@/lib/loan/chartCanvas";
import type { ScheduleSummary } from "@/lib/loan/types";

export function PieCharts({
  original,
  revised,
  principal,
  currency,
}: {
  original: ScheduleSummary | null;
  revised: ScheduleSummary | null;
  principal: number;
  currency: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    drawComparisonPies(canvas, original, revised, principal, currency, { scale: dpr, theme });
  }, [original, revised, principal, currency, theme]);

  function handleDownload() {
    const exportCanvas = document.createElement("canvas");
    drawComparisonPies(exportCanvas, original, revised, principal, currency, { scale: 3, theme });
    exportCanvasAsPng(exportCanvas, "loan_interest_principal.png");
  }

  return (
    <Card className="p-3">
      <canvas
        ref={canvasRef}
        style={{ width: PIE_CHART_WIDTH, height: PIE_CHART_HEIGHT }}
        className="mx-auto block max-w-full"
      />
      <Button type="button" size="lg" onClick={handleDownload} className="mt-2 w-full">
        <Download size={15} />
        Download chart (PNG)
      </Button>
    </Card>
  );
}
