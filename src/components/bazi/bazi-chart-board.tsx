"use client";

import type { BaZiChartResult } from "@/lib/astrology-engine";
import { exportChartAsPng } from "@/lib/export-chart-image";
import { useRef, useState } from "react";
import { BaziClassicChart } from "./bazi-classic-chart";
import { BaziDayBoundaryPanel } from "./bazi-day-boundary-panel";

type BaziChartBoardProps = {
  chart: BaZiChartResult;
  chartId?: string;
  fullName?: string | null;
  birthPlace?: string | null;
  initialReferenceYear?: number;
};

export function yearOptions() {
  const current = new Date().getFullYear();
  const years: number[] = [];
  for (let y = current + 5; y >= 1920; y--) years.push(y);
  return years;
}

export function BaziChartBoard({
  chart: initialChart,
  chartId,
  fullName,
  birthPlace,
  initialReferenceYear,
}: BaziChartBoardProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const options = yearOptions();
  const [chart, setChart] = useState(initialChart);
  const [referenceYear] = useState(() => {
    const y = initialReferenceYear ?? new Date().getFullYear();
    return options.includes(y) ? y : new Date().getFullYear();
  });
  const [exporting, setExporting] = useState(false);

  async function handleDownload() {
    const node = chartRef.current;
    if (!node) return;

    setExporting(true);
    try {
      await exportChartAsPng(node, { fullName, referenceYear });
    } catch {
      /* silent — button resets */
    } finally {
      setExporting(false);
    }
  }

  return (
    <div>
      {chartId ? (
        <BaziDayBoundaryPanel
          chartId={chartId}
          chart={chart}
          onChartUpdated={setChart}
        />
      ) : null}
      <BaziClassicChart
        ref={chartRef}
        chart={chart}
        chartId={chartId}
        fullName={fullName}
        birthPlace={birthPlace}
        referenceYear={referenceYear}
        onDownload={handleDownload}
        exporting={exporting}
      />
    </div>
  );
}
