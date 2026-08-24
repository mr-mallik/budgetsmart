"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, ImageDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTheme } from "@/context/ThemeContext";
import { drawAsciiReport } from "@/lib/reportCanvas";
import { exportCanvasAsPng } from "@/lib/chartCanvas";

export function AsciiReport({ reportText }: { reportText: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    const dims = drawAsciiReport(canvas, reportText, { scale: dpr, theme });
    if (dims) setSize(dims);
  }, [reportText, theme]);

  function handleDownloadImage() {
    const exportCanvas = document.createElement("canvas");
    drawAsciiReport(exportCanvas, reportText, { scale: 3, theme });
    exportCanvasAsPng(exportCanvas, "budget_report.png");
  }

  function handleDownloadText() {
    const blob = new Blob([reportText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "budget_report.txt";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <Card className="p-3">
      <div className="mb-2 flex items-center gap-2 px-0.5 text-xs font-medium text-muted-foreground">
        <FileText size={13} />
        Text report
      </div>
      <div className="overflow-x-auto rounded-xl bg-background">
        <canvas
          ref={canvasRef}
          className="block"
          style={size ? { width: size.width, height: size.height } : undefined}
        />
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <Button type="button" size="lg" onClick={handleDownloadImage}>
          <ImageDown size={15} />
          PNG
        </Button>
        <Button type="button" variant="outline" size="lg" onClick={handleDownloadText}>
          <FileText size={15} />
          .txt
        </Button>
      </div>
    </Card>
  );
}
